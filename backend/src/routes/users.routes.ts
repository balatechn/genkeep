import { Router } from 'express';
import Joi from 'joi';
import { listUsers, createUser, updateUser, deleteUser } from '../controllers/users.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const createSchema = Joi.object({
  name:     Joi.string().min(2).max(100).required(),
  email:    Joi.string().email({ tlds: { allow: false } }).required(),
  password: Joi.string().min(8).required(),
  role:     Joi.string().valid('ADMIN', 'VIEWER').default('VIEWER'),
});

router.use(authenticate, requireAdmin);

router.get('/',      listUsers);
router.post('/',     validate(createSchema), createUser);
router.put('/:id',   updateUser);
router.delete('/:id', deleteUser);

export default router;
