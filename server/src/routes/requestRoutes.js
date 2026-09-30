import express from 'express';
import {
  createRequest,
  getRequests,
  getRequestById,
  updateRequest,
  deleteRequest
} from '../controllers/requestController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { createRequestSchema, updateRequestSchema } from '../validators/requestValidator.js';

const router = express.Router();

router.use(authenticate);

router.post('/', validate(createRequestSchema), createRequest);
router.get('/', getRequests);
router.get('/:id', getRequestById);
router.patch('/:id', validate(updateRequestSchema), updateRequest);
router.delete('/:id', deleteRequest);

export default router;
