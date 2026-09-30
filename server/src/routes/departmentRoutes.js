import express from 'express';
import { getDepartments, createDepartment, updateDepartment } from '../controllers/departmentController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getDepartments);
router.post('/', requireRole('ADMIN'), createDepartment);
router.patch('/:id', requireRole('ADMIN'), updateDepartment);

export default router;
