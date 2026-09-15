import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class GapsService {
  constructor(private prisma: PrismaService) {}

  private priorityOf(gapSize: number): 'HIGH' | 'MED' | 'LOW' {
    if (gapSize >= 3) return 'HIGH';
    if (gapSize === 2) return 'MED';
    return 'LOW';
  }

  private async recommendedCourseIds(competencyIds: string[]): Promise<Record<string, string[]>> {
    const links = await this.prisma.courseCompetency.findMany({
      where: { competencyId: { in: competencyIds } },
      select: { competencyId: true, courseId: true },
    });
    const result: Record<string, string[]> = {};
    for (const link of links) {
      (result[link.competencyId] ??= []).push(link.courseId);
    }
    return result;
  }

  async findByOfficer(officerId: string) {
    const profiles = await this.prisma.officerCompetencyProfile.findMany({
      where: { officerId },
      include: { competency: true },
    });

    const courseMap = await this.recommendedCourseIds(profiles.map((p) => p.competencyId));

    return profiles
      .map((p) => ({
        id: `${officerId}:${p.competencyId}`,
        officerId,
        competencyId: p.competencyId,
        gapSize: p.targetLevel - p.currentLevel,
        priority: this.priorityOf(p.targetLevel - p.currentLevel),
        recommendedCourseIds: courseMap[p.competencyId] ?? [],
        competency: p.competency,
      }))
      .filter((g) => g.gapSize > 0)
      .sort((a, b) => b.gapSize - a.gapSize);
  }

  async findHighPriorityByDivision(divisionId: string) {
    const profiles = await this.prisma.officerCompetencyProfile.findMany({
      where: { officer: { divisionId } },
      include: { competency: true, officer: true },
    });

    return profiles
      .map((p) => {
        const gapSize = p.targetLevel - p.currentLevel;
        return {
          id: `${p.officerId}:${p.competencyId}`,
          officerId: p.officerId,
          competencyId: p.competencyId,
          gapSize,
          priority: this.priorityOf(gapSize),
          recommendedCourseIds: [],
          competency: p.competency,
          officer: p.officer,
        };
      })
      .filter((g) => g.gapSize > 0 && g.priority === 'HIGH')
      .sort((a, b) => b.gapSize - a.gapSize);
  }

  async getDivisionHeatmap(divisionId: string) {
    const profiles = await this.prisma.officerCompetencyProfile.findMany({
      where: { officer: { divisionId } },
      include: { competency: true, officer: true },
    });

    const heatmap: Record<string, { competency: any; gaps: any[]; avgGap: number }> = {};
    for (const p of profiles) {
      const gapSize = p.targetLevel - p.currentLevel;
      if (gapSize <= 0) continue;
      const key = p.competencyId;
      if (!heatmap[key]) {
        heatmap[key] = { competency: p.competency, gaps: [], avgGap: 0 };
      }
      heatmap[key].gaps.push({ ...p, gapSize });
    }

    for (const key of Object.keys(heatmap)) {
      const entry = heatmap[key];
      entry.avgGap = entry.gaps.reduce((sum, g) => sum + g.gapSize, 0) / entry.gaps.length;
    }

    return Object.values(heatmap).sort((a, b) => b.avgGap - a.avgGap);
  }
}