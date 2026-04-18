import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import fs from 'fs';
import path from 'path';

import { auth } from '../middleware/auth';
import { login, signup } from '../controllers/auth';
import { uploadStatement } from '../controllers/upload';
import { 
  getLatestReport, 
  getReportById, 
  getHistory, 
  simulate, 
  deleteUserData,
  getChatHistory,
  simulateChat
} from '../controllers/dashboard';

const router = Router();

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) => cb(null, uploadDir),
  filename: (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

router.post('/auth/signup', signup);
router.post('/auth/login', login);

router.post('/statement/upload', auth, upload.single('file'), (req: Request, res: Response, next: NextFunction) => {
  uploadStatement(req, res).catch(next);
});

router.get('/dashboard/latest', auth, getLatestReport);
router.get('/report/:id', auth, getReportById);
router.get('/history', auth, getHistory);
router.post('/simulate', auth, simulate);
router.get('/simulate/chat', auth, getChatHistory);
router.post('/simulate/chat', auth, simulateChat);
router.delete('/user/data', auth, deleteUserData);

export default router;
