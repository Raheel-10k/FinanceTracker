import { Request, Response } from 'express';
import { Report } from '../models/Report';
import { Upload } from '../models/Upload';
import { Transaction } from '../models/Transaction';
import { User } from '../models/User';
import { generateSimulatorAdvice } from '../ai/groq';

export const getLatestReport = async (req: Request, res: Response) => {
  try {
    const report = await Report.findOne({ userId: (req as any).userId }).sort({ createdAt: -1 });
    if (!report) return res.json({ report: null });
    res.json({ report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getReportById = async (req: Request, res: Response) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: (req as any).userId });
    if (!report) return res.status(404).json({ error: 'Report not found' });
    res.json({ report });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getHistory = async (req: Request, res: Response) => {
  try {
    const reports = await Report.find({ userId: (req as any).userId }).sort({ createdAt: -1 });
    res.json({ reports });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const simulate = async (req: Request, res: Response) => {
  try {
    const { reduceDailySpend, extraIncome, delayIncomeDays } = req.body;
    const report = await Report.findOne({ userId: (req as any).userId }).sort({ createdAt: -1 });
    if (!report) return res.status(400).json({ error: 'No report available for simulation' });

    const newBurnRate = Math.max(1, report.burnRate - reduceDailySpend);
    const balanceEstimate = (report.statementSummary?.retainedBalance || 0) + extraIncome + (reduceDailySpend * 30);
    const newRunway = Math.floor(balanceEstimate / newBurnRate);
    const newRunwayDate = new Date(Date.now() + newRunway * 86400000);
    
    const newScore = Math.min(100, report.survivalScore + Math.floor(reduceDailySpend / 20));
    const newGuiltScore = Math.max(0, report.guiltScore - Math.floor(reduceDailySpend / 10));

    const aiAdvice = await generateSimulatorAdvice({
      reduceDailySpend,
      extraIncome,
      delayIncomeDays,
      newRunwayDate: newRunway,
      projectedBalance: balanceEstimate
    });

    res.json({
      newRunwayDate: newRunwayDate.toISOString().split('T')[0],
      newRunway,
      newScore,
      newGuiltScore,
      projectedBalance: balanceEstimate,
      aiAdvice
    });

  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteUserData = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    await Report.deleteMany({ userId });
    await Transaction.deleteMany({ userId });
    await Upload.deleteMany({ userId });
    // Keep user account, just delete data
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
