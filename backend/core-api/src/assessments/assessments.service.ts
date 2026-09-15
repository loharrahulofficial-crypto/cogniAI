import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AssessmentsService {
  constructor(private prisma: PrismaService) {}

  async findPendingReview() {
    return this.prisma.assessment.findMany({
      where: { reviewStatus: 'PENDING' },
      include: { competency: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async approve(id: string, reviewedBy: string) {
    return this.prisma.assessment.update({
      where: { id },
      data: {
        reviewStatus: 'APPROVED',
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
  }

  async reject(id: string, reviewedBy: string) {
    return this.prisma.assessment.update({
      where: { id },
      data: {
        reviewStatus: 'REJECTED',
        reviewedBy,
        reviewedAt: new Date(),
      },
    });
  }

  async findByCompetency(competencyId: string) {
    return this.prisma.assessment.findMany({
      where: { competencyId, reviewStatus: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
    });
  }
}
