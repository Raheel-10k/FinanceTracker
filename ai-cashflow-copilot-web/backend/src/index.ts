// Backend structure stub
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
// Example routes
// import authRoutes from './routes/auth';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Routes setup
// app.use('/api/auth', authRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', app: 'AI Cashflow Survival Copilot Backend' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
