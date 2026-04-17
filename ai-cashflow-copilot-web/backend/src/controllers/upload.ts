import { Request, Response } from 'express';
import { Upload } from '../models/Upload';
import { Transaction } from '../models/Transaction';
import { Report } from '../models/Report';
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
    console.log(`[UploadController] Parsed ${txsData.length} total transactions successfully.`);

    // Save transactions
    const txRecords = txsData.map(tx => ({
      userId,
      uploadId: upload._id,
      ...tx
    }));
    await Transaction.insertMany(txRecords);

    // Deterministic Analysis
    const totalCredits = txsData.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const totalDebits = txsData.filter(t => t.type === 'debit').reduce((sum, t) => sum + t.amount, 0);
    
    // Sort logic to find true date span
    const sortedTxs = [...txsData].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const firstDateMs = new Date(sortedTxs[0].date).getTime();
    const lastDateMs = new Date(sortedTxs[sortedTxs.length - 1].date).getTime();
    
    let actualDaysSpanned = Math.ceil((lastDateMs - firstDateMs) / (1000 * 60 * 60 * 24));
    if (actualDaysSpanned < 1 || isNaN(actualDaysSpanned)) actualDaysSpanned = 30;
    
    const burnRate = totalDebits / actualDaysSpanned;
    
    // Check if the AI managed to pull a real trailing balance value
    let currentBalance = [...sortedTxs].reverse().find(t => t.balance && t.balance > 0)?.balance || 0;
    
    // If the bank statement didn't have readable balances, formulate a theoretical max balance from credits
    if (currentBalance === 0) {
      currentBalance = Math.max(totalCredits, totalDebits + 5000); // Baseline buffer for demo prototype
    }

    const runway = burnRate > 0 ? Math.floor(currentBalance / burnRate) : 999;
    const retainedBalance = currentBalance;
    
    const microLeaksTxs = txsData.filter(t => t.type === 'debit' && t.amount <= 200).map(t => ({
      date: t.date,
      description: t.description,
      amount: t.amount
    }));
    const microLeakAmount = microLeaksTxs.reduce((s, t) => s + t.amount, 0);
    const largestSpend = Math.max(...txsData.filter(t => t.type === 'debit').map(t => t.amount), 0);

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
        txCount: txsData.length,
        largestSpend,
        averageDailySpend: Math.round(burnRate)
      },
      aiNarrative: aiResp.aiNarrative,
      simulatorAdvice: aiResp.recommendation,
      insights: aiResp.insights,
      microLeakTransactions: microLeaksTxs
    });
    await report.save();

    upload.status = 'parsed';
    await upload.save();

    console.log(`[UploadController] Report ${report._id} generated and saved correctly.`);
    res.json({ success: true, reportId: report._id, message: 'Statement analyzed' });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
