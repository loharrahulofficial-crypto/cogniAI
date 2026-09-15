import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GapsService {
  constructor(private prisma: PrismaService) {}

  async findByOfficer(officerId: string) {
    return this.prisma.gapRecord.findMany({
      where: { officerId },
      include: { competency: true },
      orderBy: { gapSize: 'desc' },
    });
  }

  async findHighPriorityByDivision(divisionId: string) {
    return this.prisma.gapRecord.findMany({
      where: {
        officer: { divisionId },
        priority: 'HIGH',
      },
      include: {
        competency: true,
        officer: true,
      },
      orderBy: { gapSize: 'desc' },
    });
  }

  async getDivisionHeatmap(divisionId: string) {
    const gaps = await this.prisma.gapRecord.findMany({
      where: { officer: { divisionId } },
      include: {
        competency: true,
        officer: true,
      },
    });

    // Group by competency
    const heatmap: Record<string, { competency: any; gaps: any[]; avgGap: number }> = {};
    for (const gap of gaps) {
      const key = gap.competencyId;
      if (!heatmap[key]) {
        heatmap[key] = { competency: gap.competency, gaps: [], avgGap: 0 };
      }
      heatmap[key].gaps.push(gap);
    }

    // Calculate average gap per competency
    for (const key of Object.keys(heatmap)) {
      const entry = heatmap[key];
      entry.avgGap = entry.gaps.reduce((sum, g) => sum + g.gapSize, 0) / entry.gaps.length;
    }

    return Object.values(heatmap).sort((a, b) => b.avgGap - a.avgGap);
  }
}
