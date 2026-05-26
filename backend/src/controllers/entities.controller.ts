import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { logActivity } from '../services/audit.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function listEntities(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { typeCode, search } = req.query as Record<string, string>;

    const where: Record<string, unknown> = {};
    if (typeCode) where.entityType = { code: typeCode };
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const entities = await prisma.entity.findMany({
      where,
      include: {
        entityType: true,
        _count: { select: { credentials: true } },
      },
      orderBy: { name: 'asc' },
    });
    res.json(entities);
  } catch (err) {
    next(err);
  }
}

export async function getEntity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const entity = await prisma.entity.findUnique({
      where: { id: req.params.id },
      include: { entityType: true, credentials: { select: { id: true, title: true, username: true, updatedAt: true } } },
    });
    if (!entity) { res.status(404).json({ error: 'Entity not found' }); return; }
    res.json(entity);
  } catch (err) {
    next(err);
  }
}

export async function createEntity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { entityTypeId, name, description } = req.body;
    const entity = await prisma.entity.create({
      data: { entityTypeId, name, description },
      include: { entityType: true },
    });
    await logActivity({ req, userId: req.user!.userId, action: 'CREATE', targetType: 'entity', targetId: entity.id });
    res.status(201).json(entity);
  } catch (err) {
    next(err);
  }
}

export async function updateEntity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, description } = req.body;
    const entity = await prisma.entity.update({
      where: { id: req.params.id },
      data: { ...(name && { name }), ...(description !== undefined && { description }) },
      include: { entityType: true },
    });
    await logActivity({ req, userId: req.user!.userId, action: 'UPDATE', targetType: 'entity', targetId: entity.id });
    res.json(entity);
  } catch (err) {
    next(err);
  }
}

export async function deleteEntity(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.entity.delete({ where: { id: req.params.id } });
    await logActivity({ req, userId: req.user!.userId, action: 'DELETE', targetType: 'entity', targetId: req.params.id });
    res.json({ message: 'Entity deleted' });
  } catch (err) {
    next(err);
  }
}

export async function listEntityTypes(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const types = await prisma.entityType.findMany({ orderBy: { label: 'asc' } });
    res.json(types);
  } catch (err) {
    next(err);
  }
}
