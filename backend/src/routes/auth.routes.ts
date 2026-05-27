import { Router } from 'express';
import Joi from 'joi';
import { login, logout, me, refresh } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const loginSchema = Joi.object({
  email:    Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(1).required(),
});

router.post('/login',   validate(loginSchema),           login);
router.post('/refresh', refresh);
router.post('/logout',  authenticate,                    logout);
router.get('/me',       authenticate,                    me);

export default router;
