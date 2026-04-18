import mongoose from 'mongoose';

export const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/cashflowcopilot';
    const dbName = process.env.DB_NAME || 'cashflowcopilot';
    
    await mongoose.connect(uri, {
      dbName: dbName
    });
    console.log(`MongoDB Connected to database: ${dbName}`);
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};
