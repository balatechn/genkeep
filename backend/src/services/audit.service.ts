import { prisma } from '../config/db';
import { LogAction } from '@prisma/client';
import { Request } from 'express';

export async function logActivity(params: {
  req?: Request;
  userId?: string;
  action: LogAction;
  targetType?: string;
  targetId?: string;
  description?: string;
}): Promise<void> {
  try {
    await prisma.activityLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        targetType: params.targetType,
        targetId: params.targetId,
        description: params.description,
        ipAddress: params.req?.ip,
        userAgent: params.req?.get('user-agent'),
      },
    });
  } catch {
    // Never let audit logging crash the request
  }
}
