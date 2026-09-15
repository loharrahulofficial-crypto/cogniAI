import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async findByOfficer(officerId: string) {
    return this.prisma.recommendation.findMany({
      where: { officerId },
      orderBy: { priority: 'asc' },
    });
  }
}
