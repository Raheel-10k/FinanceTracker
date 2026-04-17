import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import apiRoutes from './routes/api';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Main Routes
app.use('/api', apiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'healthy', app: 'AI Cashflow Survival Copilot Backend' });
});

const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
