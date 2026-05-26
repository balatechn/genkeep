import { Router } from 'express';
import { getLogs, getDashboardStats, getExpiryReport } from '../controllers/reports.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/dashboard',      getDashboardStats);
router.get('/expiry',         getExpiryReport);
router.get('/logs',           requireAdmin, getLogs);

export default router;
