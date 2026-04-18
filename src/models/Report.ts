import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload' },
  survivalScore: { type: Number, required: true },
  guiltScore: { type: Number, required: true },
  guiltLabel: { type: String, required: true },
  runwayDate: { type: Date, required: true },
  burnRate: { type: Number, required: true },
  microLeakAmount: { type: Number, required: true },
  recurringCount: { type: Number, required: true },
  confidence: { type: String, required: true },
  statementSummary: {
    totalCredits: Number,
    totalDebits: Number,
    retainedBalance: Number,
    txCount: Number,
    largestSpend: Number,
    averageDailySpend: Number,
    actualDaysSpanned: Number
  },
  aiNarrative: { type: String },
  simulatorAdvice: { type: String },
  insights: [{ type: String }],
  microLeakTransactions: [{
    date: Date,
    description: String,
    amount: Number,
    hoverMessage: String
  }],
  categoryTotals: {
    shopping: { 
      total: { type: Number, default: 0 },
      transactions: [{ date: Date, description: String, amount: Number }]
    },
    food: { 
      total: { type: Number, default: 0 },
      transactions: [{ date: Date, description: String, amount: Number }]
    },
    quickComm: { 
      total: { type: Number, default: 0 },
      transactions: [{ date: Date, description: String, amount: Number }]
    },
    other: { 
      total: { type: Number, default: 0 },
      transactions: [{ date: Date, description: String, amount: Number }]
    }
  }
}, { timestamps: true });

const userRuleSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  descriptionPattern: { type: String, required: true },
  category: { type: String, required: true, enum: ['shopping', 'food', 'quickComm'] }
}, { timestamps: true });

export const Report = mongoose.model('Report', reportSchema);
export const UserRule = mongoose.model('UserRule', userRuleSchema);
