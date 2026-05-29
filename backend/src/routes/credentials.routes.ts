import { Router } from 'express';
import Joi from 'joi';
import {
  listCredentials,
  getCredential,
  revealCredential,
  createCredential,
  updateCredential,
  deleteCredential,
} from '../controllers/credentials.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const createSchema = Joi.object({
  entityId:   Joi.string().uuid().required(),
  title:      Joi.string().min(1).max(200).required(),
  urlOrIp:    Joi.string().max(500).allow('', null),
  username:   Joi.string().min(1).max(200).required(),
  password:   Joi.string().min(1).required(),
  notes:      Joi.string().max(2000).allow('', null),
  expiryDate: Joi.date().iso().allow(null),
  tags:       Joi.array().items(Joi.string()).default([]),
});

const updateSchema = Joi.object({
  entityId:   Joi.string().uuid(),
  title:      Joi.string().min(1).max(200),
  urlOrIp:    Joi.string().max(500).allow('', null),
  username:   Joi.string().min(1).max(200),
  password:   Joi.string().min(1),
  notes:      Joi.string().max(2000).allow('', null),
  expiryDate: Joi.date().iso().allow(null),
  tags:       Joi.array().items(Joi.string()),
}).min(1);

router.use(authenticate);

router.get('/',           listCredentials);
router.get('/:id',        getCredential);
router.post('/:id/reveal', revealCredential);
router.post('/',          validate(createSchema),  createCredential);
router.put('/:id',        validate(updateSchema),  updateCredential);
router.delete('/:id',     requireAdmin,            deleteCredential);

export default router;
