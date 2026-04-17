import mongoose from 'mongoose';

const uploadSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bankName: { type: String, required: true },
  fileName: { type: String, required: true },
  filePath: { type: String, required: true },
  status: { type: String, enum: ['uploaded', 'parsing', 'parsed', 'failed'], default: 'uploaded' }
}, { timestamps: true });

export const Upload = mongoose.model('Upload', uploadSchema);
