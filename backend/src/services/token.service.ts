import jwt, { SignOptions } from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/db';

export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
}

export function signAccessToken(payload: TokenPayload): string {
  const opts: SignOptions = { expiresIn: (process.env.JWT_ACCESS_EXPIRY || '15m') as SignOptions['expiresIn'] };
  return jwt.sign(payload, process.env.JWT_SECRET as string, opts);
}

export function signRefreshToken(payload: TokenPayload): string {
  const opts: SignOptions = { expiresIn: (process.env.JWT_REFRESH_EXPIRY || '7d') as SignOptions['expiresIn'] };
  return jwt.sign(payload, process.env.JWT_REFRESH_SECRET as string, opts);
}

export function verifyAccessToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_SECRET as string) as TokenPayload;
}

export function verifyRefreshToken(token: string): TokenPayload {
  return jwt.verify(token, process.env.JWT_REFRESH_SECRET as string) as TokenPayload;
}

export async function saveRefreshToken(userId: string, token: string): Promise<void> {
  const decoded = jwt.decode(token) as { exp: number };
  const expiresAt = new Date(decoded.exp * 1000);
  await prisma.refreshToken.create({ data: { id: uuidv4(), token, userId, expiresAt } });
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.deleteMany({ where: { token } });
}

export async function isRefreshTokenValid(token: string): Promise<boolean> {
  const record = await prisma.refreshToken.findUnique({ where: { token } });
  return !!record && record.expiresAt > new Date();
}
