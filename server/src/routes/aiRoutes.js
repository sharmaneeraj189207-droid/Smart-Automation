import express from 'express';
import {
  classify,
  extract,
  priority,
  recommend,
  summarize,
  duplicateCheck
} from '../controllers/aiController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.post('/classify', classify);
router.post('/extract', extract);
router.post('/priority', priority);
router.post('/recommend', recommend);
router.post('/summarize', summarize);
router.post('/duplicate-check', duplicateCheck);

export default router;
