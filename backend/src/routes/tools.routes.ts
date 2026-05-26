import { Router } from 'express';
import { generate } from '../controllers/generator.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);
router.post('/generate-password', generate);

export default router;
