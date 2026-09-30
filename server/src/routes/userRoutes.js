import express from 'express';
import { getUsers, getUserById, updateUser, deleteUser } from '../controllers/userController.js';
import { authenticate, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.use(authenticate);

// Admin only user management
router.get('/', requireRole(['ADMIN', 'MANAGER']), getUsers);
router.get('/:id', requireRole(['ADMIN', 'MANAGER']), getUserById);
router.patch('/:id', requireRole('ADMIN'), updateUser);
router.delete('/:id', requireRole('ADMIN'), deleteUser);

export default router;
