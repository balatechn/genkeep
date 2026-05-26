import { Router } from 'express';
import Joi from 'joi';
import { listEntities, getEntity, createEntity, updateEntity, deleteEntity, listEntityTypes } from '../controllers/entities.controller';
import { authenticate, requireAdmin } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';

const router = Router();

const createSchema = Joi.object({
  entityTypeId: Joi.string().uuid().required(),
  name:         Joi.string().min(1).max(200).required(),
  description:  Joi.string().max(500).allow('', null),
});

router.use(authenticate);

router.get('/types',  listEntityTypes);
router.get('/',       listEntities);
router.get('/:id',    getEntity);
router.post('/',      requireAdmin, validate(createSchema), createEntity);
router.put('/:id',    requireAdmin,                         updateEntity);
router.delete('/:id', requireAdmin,                         deleteEntity);

export default router;
