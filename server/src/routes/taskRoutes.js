import express from 'express';
import { getTasks, createTask, updateTask, completeTask } from '../controllers/taskController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createTaskSchema, updateTaskSchema, completeTaskSchema } from '../validators/taskValidator.js';

const router = express.Router();

router.use(authenticate);

router.get('/', getTasks);
router.post('/', validate(createTaskSchema), createTask);
router.patch('/:id', validate(updateTaskSchema), updateTask);
router.post('/:id/complete', validate(completeTaskSchema), completeTask);

export default router;
