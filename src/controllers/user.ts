import { Request, Response } from 'express';
import { UserRule } from '../models/Report';

export const addUserRule = async (req: Request, res: Response) => {
  const userId = (req as any).userId;
  const { descriptionPattern, category } = req.body;

  if (!descriptionPattern || !category) {
    return res.status(400).json({ error: 'Missing logic' });
  }

  try {
    console.log(`[Categorize] Saving rule for user ${userId}: ${descriptionPattern} -> ${category}`);
    // Check if rule already exists for this pattern
    const existingRule = await UserRule.findOne({ userId, descriptionPattern: descriptionPattern.toUpperCase() });
    
    if (existingRule) {
      existingRule.category = category;
      await existingRule.save();
    } else {
      const rule = new UserRule({
        userId,
        descriptionPattern: descriptionPattern.toUpperCase(),
        category
      });
      await rule.save();
    }

    res.json({ success: true, message: 'Rule saved. Next statement upload will reflect this.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};
