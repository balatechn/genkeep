import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { prisma } from '../config/db';
import {
  signAccessToken,
  signRefreshToken,
  saveRefreshToken,
  revokeRefreshToken,
  isRefreshTokenValid,
  verifyRefreshToken,
} from '../services/token.service';
import { logActivity } from '../services/audit.service';
import { AuthRequest } from '../middleware/auth.middleware';

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.isActive) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      await logActivity({ req, action: 'LOGIN', description: `Failed login for ${email}` });
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);
    await saveRefreshToken(user.id, refreshToken);

    await logActivity({ req, userId: user.id, action: 'LOGIN', description: 'Successful login' });

    res.json({
      accessToken,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    });
  } catch (err) {
    next(err);
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) { res.status(400).json({ error: 'Refresh token required' }); return; }

    const valid = await isRefreshTokenValid(refreshToken);
    if (!valid) { res.status(401).json({ error: 'Invalid refresh token' }); return; }

    const decoded = verifyRefreshToken(refreshToken);
    await revokeRefreshToken(refreshToken);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user || !user.isActive) { res.status(401).json({ error: 'User not found' }); return; }

    const payload = { userId: user.id, email: user.email, role: user.role };
    const newAccess = signAccessToken(payload);
    const newRefresh = signRefreshToken(payload);
    await saveRefreshToken(user.id, newRefresh);

    res.json({ accessToken: newAccess, refreshToken: newRefresh });
  } catch (err) {
    next(err);
  }
}

export async function logout(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (refreshToken) await revokeRefreshToken(refreshToken);
    await logActivity({ req, userId: req.user?.userId, action: 'LOGOUT' });
    res.json({ message: 'Logged out successfully' });
  } catch (err) {
    next(err);
  }
}

export async function me(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    res.json(user);
  } catch (err) {
    next(err);
  }
}
