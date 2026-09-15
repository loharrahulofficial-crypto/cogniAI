import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuditService {
  constructor(private prisma: PrismaService) {}

  async log(entry: {
    actorId: string;
    actorRole: string;
    action: string;
    entityType: string;
    entityId: string;
    beforeState?: any;
    afterState?: any;
    rationaleShown?: string;
  }) {
    return this.prisma.auditLogEntry.create({ data: entry });
  }

  async findAll(entityType?: string, entityId?: string) {
    const where: any = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;

    return this.prisma.auditLogEntry.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }
}
