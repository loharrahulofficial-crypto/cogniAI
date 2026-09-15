import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AssessmentsService {
  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  async findPendingReview() {
    return this.prisma.assessment.findMany({
      where: { reviewStatus: 'PENDING' },
      include: { competency: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: string, reviewedBy: string) {
    const before = await this.prisma.assessment.findUniqueOrThrow({ where: { id } });
    const updated = await this.prisma.assessment.update({
      where: { id },
      data: {
        reviewStatus: 'APPROVED',
        reviewedBy,
        reviewedAt: new Date(),
      },
    });

    await this.auditService.log({
      actorId: reviewedBy,
      actorRole: 'CONTENT_ADMIN',
      action: 'APPROVE_MCQ',
      entityType: 'MCQ',
      entityId: id,
      beforeState: { reviewStatus: before.reviewStatus },
      afterState: { reviewStatus: 'APPROVED' },
      rationaleShown: `MCQ approved by ${reviewedBy}`,
    });

    return updated;
  }

  async reject(id: string, reviewedBy: string) {
    const before = await this.prisma.assessment.findUniqueOrThrow({ where: { id } });
    const updated = await this.prisma.assessment.update({
      where: { id },
      data: {
        reviewStatus: 'REJECTED',
        reviewedBy,
        reviewedAt: new Date(),
      },
    });

    await this.auditService.log({
      actorId: reviewedBy,
      actorRole: 'CONTENT_ADMIN',
      action: 'REJECT_MCQ',
      entityType: 'MCQ',
      entityId: id,
      beforeState: { reviewStatus: before.reviewStatus },
      afterState: { reviewStatus: 'REJECTED' },
      rationaleShown: `MCQ rejected by ${reviewedBy}`,
    });

    return updated;
  }

  async findByCompetency(competencyId: string) {
    return this.prisma.assessment.findMany({
      where: { competencyId, reviewStatus: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
    });
  }
}
