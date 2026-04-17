import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  uploadId: { type: mongoose.Schema.Types.ObjectId, ref: 'Upload', required: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  type: { type: String, enum: ['credit', 'debit'], required: true },
  amount: { type: Number, required: true },
  balance: { type: Number, required: true }
});

export const Transaction = mongoose.model('Transaction', transactionSchema);
