import express from 'express';
import { getDashboardSummary, getAutomationAnalytics } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/dashboard', getDashboardSummary);
router.get('/workflows', getDashboardSummary);
router.get('/automation', getAutomationAnalytics);

export default router;
