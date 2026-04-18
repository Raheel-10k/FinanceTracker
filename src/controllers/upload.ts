import { Request, Response } from 'express';
import { Upload } from '../models/Upload';
import { Transaction } from '../models/Transaction';
import { Report, UserRule } from '../models/Report';
import { parseCSV } from '../parsers/csv';
import { parsePDF } from '../parsers/pdf';
import { generateAIInsights } from '../ai/groq';
import path from 'path';

export const uploadStatement = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const file = req.file;
  const bankName = req.body.bankName || 'Unknown Bank';

  if (!file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    const ext = path.extname(file.originalname).toLowerCase();
    const isCSV = ext === '.csv';
    const isPDF = ext === '.pdf';

    if (!isCSV && !isPDF) {
      return res.status(400).json({ error: 'Only PDF and CSV are supported' });
    }

    const upload = new Upload({
      userId,
      bankName,
      fileName: file.originalname,
      filePath: file.path,
      status: 'parsing'
    });
    await upload.save();

    let txsData: any[] = [];
    if (isCSV) {
      txsData = await parseCSV(file.path);
    } else {
      txsData = await parsePDF(file.path);
    }

    if (txsData.length === 0) {
      console.warn(`[UploadController] No transactions parsed from file ${file.path}`);
      upload.status = 'failed';
      await upload.save();
      return res.status(400).json({ error: 'Could not parse any transactions from the uploaded file' });
    }

    // --- CONTINUATION & DEDUPLICATION LOGIC ---
    // Fetch all existing transactions for this user
    const existingTxs = await Transaction.find({ userId });
    
    // Deduplication: Avoid transactions with same date, description, and amount
    const newTxsData = txsData.filter(tx => {
      const txDate = new Date(tx.date).getTime();
      const isDup = existingTxs.some(et => 
        new Date(et.date).getTime() === txDate &&
        et.description.trim() === tx.description.trim() &&
        et.amount === tx.amount
      );
      return !isDup;
    });

    console.log(`[UploadController] Parsed ${txsData.length} total. New unique transactions: ${newTxsData.length}`);

    // Store only new transactions
    if (newTxsData.length > 0) {
      const txRecords = newTxsData.map(tx => ({
        userId,
        uploadId: upload._id,
        ...tx
      }));
      await Transaction.insertMany(txRecords);
    }

    // For analysis, use ALL transactions (historical + new)
    const updatedExistingTxs = await Transaction.find({ userId }).lean();
    const allTxs = updatedExistingTxs;

    if (allTxs.length === 0) {
        return res.status(400).json({ error: 'No transactions found for analysis' });
    }

    // Deterministic Analysis over ALL history
    const totalCredits = allTxs.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = allTxs.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    
    const sortedTxs = [...allTxs].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    let firstDateMs = new Date(sortedTxs[0].date).getTime();
    let lastDateMs = new Date(sortedTxs[sortedTxs.length - 1].date).getTime();
    
    // Calculate total days spanned across entire history
    let actualDaysSpanned = Math.ceil((lastDateMs - firstDateMs) / (1000 * 60 * 60 * 24)) + 1;
    
    // Fallback if dates are weird
    if (actualDaysSpanned < 1 || isNaN(actualDaysSpanned)) actualDaysSpanned = 17; 
    
    const burnRate = totalDebits / actualDaysSpanned;
    
    // Balance calculation: Use balance from the most recent transaction
    let currentBalance = [...sortedTxs].reverse().find(t => t.balance && t.balance > 0)?.balance || 0;
    
    if (currentBalance === 0) {
      currentBalance = Math.max(totalCredits, totalDebits + 5000); 
    }

    const runway = burnRate > 0 ? Math.floor(currentBalance / burnRate) : 999;
    const retainedBalance = totalCredits - totalDebits;
    
    const microLeaksTxs = allTxs.filter(t => t.type === 'debit' && t.amount <= 200).map(t => {
      const sameAmountCount = allTxs.filter(tx => tx.amount === t.amount).length;
      let hoverMsg = "Was this really a necessary transaction?";
      
      if (sameAmountCount > 3) {
        hoverMsg = "Do you truly need to make this exact payment repeatedly?";
      } else if (t.amount > 150) {
        hoverMsg = "Could've easily avoided this spend and saved up.";
      } else if (sameAmountCount > 1) {
        hoverMsg = "Isn't this an unusual recurring habit?";
      }

      return {
        date: t.date,
        description: t.description,
        amount: t.amount,
        hoverMessage: hoverMsg
      };
    });
    
    const microLeakAmount = microLeaksTxs.reduce((s, t) => s + t.amount, 0);
    const largestSpend = Math.max(...allTxs.filter(t => t.type === 'debit').map(t => t.amount), 0);

    const shoppingVendors = ['AMAZON', 'FLIPKART', 'EKART'];
    const foodVendors = ['SWIGGY', 'ZOMATO'];
    const quickCommVendors = ['ZEPTO', 'BLINKIT'];

    const userRules = await UserRule.find({ userId });
    
    let shoppingTotal = 0;
    let foodTotal = 0;
    let quickCommTotal = 0;
    let otherTotal = 0;
    
    const shoppingTxs: any[] = [];
    const foodTxs: any[] = [];
    const quickCommTxs: any[] = [];
    const otherTxs: any[] = [];

    allTxs.forEach(t => {
      if (t.type === 'debit') {
        const desc = (t.description || '').toUpperCase();
        
        // 1. Check User Rules first
        const applicableRule = userRules.find(r => desc.includes(r.descriptionPattern.toUpperCase()));
        
        if (applicableRule) {
          if (applicableRule.category === 'shopping') {
            shoppingTotal += t.amount;
            shoppingTxs.push({ date: t.date, description: t.description, amount: t.amount });
          } else if (applicableRule.category === 'food') {
            foodTotal += t.amount;
            foodTxs.push({ date: t.date, description: t.description, amount: t.amount });
          } else if (applicableRule.category === 'quickComm') {
            quickCommTotal += t.amount;
            quickCommTxs.push({ date: t.date, description: t.description, amount: t.amount });
          }
        } 
        // 2. Check Standard Heuristics
        else if (shoppingVendors.some(v => desc.includes(v))) {
          shoppingTotal += t.amount;
          shoppingTxs.push({ date: t.date, description: t.description, amount: t.amount });
        } else if (foodVendors.some(v => desc.includes(v))) {
          foodTotal += t.amount;
          foodTxs.push({ date: t.date, description: t.description, amount: t.amount });
        } else if (quickCommVendors.some(v => desc.includes(v))) {
          quickCommTotal += t.amount;
          quickCommTxs.push({ date: t.date, description: t.description, amount: t.amount });
        } 
        // 3. Collect everything else as Other
        else {
          otherTotal += t.amount;
          otherTxs.push({ date: t.date, description: t.description, amount: t.amount });
        }
      }
    });

    const categoryTotals = {
      shopping: { total: Math.round(shoppingTotal), transactions: shoppingTxs },
      food: { total: Math.round(foodTotal), transactions: foodTxs },
      quickComm: { total: Math.round(quickCommTotal), transactions: quickCommTxs },
      other: { total: Math.round(otherTotal), transactions: otherTxs }
    };

    // Heuristics Score calculation
    let survivalScore = Math.min(100, Math.max(0, Math.floor((runway / 30) * 100)));
    let guiltScore = Math.min(100, Math.floor((microLeakAmount / Math.max(1, totalDebits)) * 100) + (burnRate > 1000 ? 50 : 0));
    
    if (runway <= 0) guiltScore = Math.max(guiltScore, 95);
    else if (runway <= 5) guiltScore = Math.max(guiltScore, 85);
    else if (runway <= 15) guiltScore = Math.max(guiltScore, 65);

    const aiResp = await generateAIInsights({
      burnRate: Math.round(burnRate),
      runway,
      guilt: guiltScore,
      retained: retainedBalance,
      totalCredits,
      totalDebits,
      microLeaks: microLeakAmount,
      largestSpend
    });

    const report = new Report({
      userId,
      uploadId: upload._id,
      survivalScore,
      guiltScore,
      guiltLabel: aiResp.guiltExplanation || "Based on your spending patterns.",
      runwayDate: new Date(Date.now() + runway * 86400000),
      burnRate: Math.round(burnRate),
      microLeakAmount,
      recurringCount: 0,
      confidence: "High",
      statementSummary: {
        totalCredits,
        totalDebits,
        retainedBalance,
        txCount: allTxs.length,
        largestSpend,
        averageDailySpend: Math.round(burnRate),
        actualDaysSpanned
      },
      aiNarrative: aiResp.aiNarrative,
      simulatorAdvice: aiResp.recommendation,
      insights: aiResp.insights,
      microLeakTransactions: microLeaksTxs,
      categoryTotals // <-- Added here
    });
    await report.save();

    upload.status = 'parsed';
    await upload.save();

    console.log(`[UploadController] Cumulative Report ${report._id} generated and saved correctly.`);
    res.json({ success: true, reportId: report._id, message: 'Statement integrated with existing data' });

  } catch (error: any) {
    console.error(`[UploadController] Error:`, error);
    res.status(500).json({ error: error.message });
  }
};
