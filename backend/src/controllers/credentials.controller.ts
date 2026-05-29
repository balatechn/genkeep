import { Response, NextFunction } from 'express';
import { prisma } from '../config/db';
import { encrypt, decrypt } from '../services/crypto.service';
import { logActivity } from '../services/audit.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function listCredentials(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { entityId, search, tag, page = '1', limit = '20' } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, unknown> = {};
    if (entityId) where.entityId = entityId;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { username: { contains: search, mode: 'insensitive' } },
        { urlOrIp: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (tag) {
      where.tags = { some: { tag: { name: tag } } };
    }

    const [total, items] = await Promise.all([
      prisma.credential.count({ where }),
      prisma.credential.findMany({
        where,
        skip,
        take: parseInt(limit),
        orderBy: { updatedAt: 'desc' },
        include: {
          entity: { include: { entityType: true } },
          tags: { include: { tag: true } },
          owner: { select: { id: true, name: true, email: true } },
        },
      }),
    ]);

    // Never return encrypted values in list – omit password fields
    const safe = items.map(({ passwordEncrypted, passwordIv, passwordTag, notesEncrypted, notesIv, notesTag, ...rest }) => rest);

    res.json({ data: safe, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    next(err);
  }
}

export async function getCredential(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const cred = await prisma.credential.findUnique({
      where: { id: req.params.id },
      include: {
        entity: { include: { entityType: true } },
        tags: { include: { tag: true } },
        owner: { select: { id: true, name: true, email: true } },
      },
    });
    if (!cred) { res.status(404).json({ error: 'Credential not found' }); return; }

    const { passwordEncrypted, passwordIv, passwordTag, notesEncrypted, notesIv, notesTag, ...safe } = cred;
    res.json(safe);
  } catch (err) {
    next(err);
  }
}

export async function revealCredential(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const cred = await prisma.credential.findUnique({ where: { id: req.params.id } });
    if (!cred) { res.status(404).json({ error: 'Credential not found' }); return; }

    const password = decrypt({ ciphertext: cred.passwordEncrypted, iv: cred.passwordIv, tag: cred.passwordTag });
    let notes: string | undefined;
    if (cred.notesEncrypted && cred.notesIv && cred.notesTag) {
      notes = decrypt({ ciphertext: cred.notesEncrypted, iv: cred.notesIv, tag: cred.notesTag });
    }

    await logActivity({
      req,
      userId: req.user!.userId,
      action: 'REVEAL',
      targetType: 'credential',
      targetId: cred.id,
      description: `Revealed password for "${cred.title}"`,
    });

    res.json({ password, notes });
  } catch (err) {
    next(err);
  }
}

export async function createCredential(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { entityId, title, urlOrIp, username, password, notes, expiryDate, tags: tagNames } = req.body;

    const { ciphertext, iv, tag } = encrypt(password);
    let notesEnc = undefined, notesIv = undefined, notesTag = undefined;
    if (notes) {
      const enc = encrypt(notes);
      notesEnc = enc.ciphertext; notesIv = enc.iv; notesTag = enc.tag;
    }

    const cred = await prisma.credential.create({
      data: {
        entityId,
        title,
        urlOrIp,
        username,
        passwordEncrypted: ciphertext,
        passwordIv: iv,
        passwordTag: tag,
        notesEncrypted: notesEnc,
        notesIv,
        notesTag,
        expiryDate: expiryDate ? new Date(expiryDate) : undefined,
        ownerId: req.user!.userId,
        tags: tagNames?.length ? {
          create: tagNames.map((name: string) => ({
            tag: { connectOrCreate: { where: { name }, create: { name } } },
          })),
        } : undefined,
      },
      include: { entity: true, tags: { include: { tag: true } } },
    });

    await logActivity({ req, userId: req.user!.userId, action: 'CREATE', targetType: 'credential', targetId: cred.id });

    const { passwordEncrypted, passwordIv, passwordTag, notesEncrypted, notesIv: ni, notesTag: nt, ...safe } = cred;
    res.status(201).json(safe);
  } catch (err) {
    next(err);
  }
}

export async function updateCredential(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { entityId, title, urlOrIp, username, password, notes, expiryDate } = req.body;
    const existing = await prisma.credential.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Credential not found' }); return; }

    let pwFields = {};
    if (password) {
      const { ciphertext, iv, tag } = encrypt(password);
      pwFields = { passwordEncrypted: ciphertext, passwordIv: iv, passwordTag: tag };
    }

    // Only update notes when a non-empty string is explicitly provided
    // (blank form field means "keep existing notes", not "erase them")
    let notesFields = {};
    if (notes) {
      const enc = encrypt(notes);
      notesFields = { notesEncrypted: enc.ciphertext, notesIv: enc.iv, notesTag: enc.tag };
    }

    const updated = await prisma.credential.update({
      where: { id: req.params.id },
      data: {
        ...(entityId && { entityId }),
        ...(title && { title }),
        ...(urlOrIp !== undefined && { urlOrIp }),
        ...(username && { username }),
        ...pwFields,
        ...notesFields,
        ...(expiryDate !== undefined && { expiryDate: expiryDate ? new Date(expiryDate) : null }),
      },
      include: { entity: true, tags: { include: { tag: true } } },
    });

    await logActivity({ req, userId: req.user!.userId, action: 'UPDATE', targetType: 'credential', targetId: updated.id });

    const { passwordEncrypted, passwordIv, passwordTag, notesEncrypted, notesIv, notesTag, ...safe } = updated;
    res.json(safe);
  } catch (err) {
    next(err);
  }
}

export async function deleteCredential(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const existing = await prisma.credential.findUnique({ where: { id: req.params.id } });
    if (!existing) { res.status(404).json({ error: 'Credential not found' }); return; }

    await prisma.credential.delete({ where: { id: req.params.id } });
    await logActivity({ req, userId: req.user!.userId, action: 'DELETE', targetType: 'credential', targetId: req.params.id });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    next(err);
  }
}
