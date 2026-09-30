import express from 'express';
import { getRules, createRule, updateRule, deleteRule } from '../controllers/ruleController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createRuleSchema, updateRuleSchema } from '../validators/ruleValidator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getRules);
router.post('/', requireRole('ADMIN'), validate(createRuleSchema), createRule);
router.patch('/:id', requireRole('ADMIN'), validate(updateRuleSchema), updateRule);
router.delete('/:id', requireRole('ADMIN'), deleteRule);

export default router;
