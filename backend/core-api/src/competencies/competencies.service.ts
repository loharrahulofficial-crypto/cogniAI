import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CompetenciesService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    const where = category ? { category: category as any } : {};
    return this.prisma.competency.findMany({
      where,
      include: {
        activity: { include: { role: true } },
        proficiencyLevels: { orderBy: { level: 'asc' } },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.competency.findUnique({
      where: { id },
      include: {
        activity: { include: { role: true } },
        proficiencyLevels: { orderBy: { level: 'asc' } },
      },
    });
  }
}
