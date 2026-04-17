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
    averageDailySpend: Number
  },
  aiNarrative: { type: String },
  simulatorAdvice: { type: String },
  insights: [{ type: String }],
  microLeakTransactions: [{
    date: Date,
    description: String,
    amount: Number
  }]
}, { timestamps: true });

export const Report = mongoose.model('Report', reportSchema);
