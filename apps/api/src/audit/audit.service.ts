import { Injectable } from '@nestjs/common';
import { AuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../infrastructure/prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async record(input: {
    action: AuditAction;
    entityType: string;
    entityId?: string;
    workspaceId?: string;
    actorUserId?: string;
    metadata?: Prisma.InputJsonValue;
    ipHash?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.prisma.auditLog.create({ data: {
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      workspaceId: input.workspaceId,
      actorUserId: input.actorUserId,
      metadata: input.metadata,
      ipHash: input.ipHash,
      userAgent: input.userAgent,
    } });
  }
}
