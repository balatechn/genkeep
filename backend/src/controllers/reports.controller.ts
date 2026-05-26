import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { AuthRequest } from '../middleware/auth.middleware';

export async function getLogs(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { action, userId, page = '1', limit = '50' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, unknown> = {};
    if (action) where.action = action;
    if (userId) where.userId = userId;

    const [total, logs] = await Promise.all([
      prisma.activityLog.count({ where }),
      prisma.activityLog.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, email: true } } },
      }),
    ]);

    res.json({ data: logs, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
}

export async function getDashboardStats(_req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const now = new Date();
    const thirtyDaysOut = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    const [totalEntities, totalCredentials, expiringSoon, recentlyUpdated] = await Promise.all([
      prisma.entity.count(),
      prisma.credential.count(),
      prisma.credential.count({ where: { expiryDate: { gte: now, lte: thirtyDaysOut } } }),
      prisma.credential.findMany({
        orderBy: { updatedAt: 'desc' },
        take: 5,
        include: { entity: { include: { entityType: true } } },
      }),
    ]);

    res.json({ totalEntities, totalCredentials, expiringSoon, recentlyUpdated });
  } catch (err) {
    next(err);
  }
}

export async function getExpiryReport(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const days = parseInt((req.query.days as string) || '30');
    const threshold = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

    const items = await prisma.credential.findMany({
      where: { expiryDate: { lte: threshold, gte: new Date() } },
      include: { entity: { include: { entityType: true } }, owner: { select: { name: true, email: true } } },
      orderBy: { expiryDate: 'asc' },
    });

    const safe = items.map(({ passwordEncrypted, passwordIv, passwordTag, notesEncrypted, notesIv, notesTag, ...rest }) => rest);
    res.json(safe);
  } catch (err) {
    next(err);
  }
}
