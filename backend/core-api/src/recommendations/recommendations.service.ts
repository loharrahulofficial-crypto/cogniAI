import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
  constructor(private prisma: PrismaService) {}

  async findByOfficer(officerId: string) {
    const profiles = await this.prisma.officerCompetencyProfile.findMany({
      where: { officerId },
      include: { competency: true },
    });

    const gaps = profiles
      .map((p) => ({ ...p, gapSize: p.targetLevel - p.currentLevel }))
      .filter((p) => p.gapSize > 0)
      .sort((a, b) => b.gapSize - a.gapSize);

    if (gaps.length === 0) return [];

    const competencyIds = gaps.map((g) => g.competencyId);
    const links = await this.prisma.courseCompetency.findMany({
      where: { competencyId: { in: competencyIds } },
      include: { competency: true, course: true },
    });

    const byCompetency: Record<string, typeof links> = {};
    for (const link of links) {
      (byCompetency[link.competencyId] ??= []).push(link);
    }

    let priority = 1;
    const seen = new Set<string>();
    const results: Array<{
      id: string;
      officerId: string;
      courseId: string;
      rationale: string;
      priority: number;
      course: { name: string; source: string; organisation: string; duration: string };
    }> = [];

    for (const gap of gaps) {
      const courseLinks = byCompetency[gap.competencyId] ?? [];
      for (const cl of courseLinks) {
        if (seen.has(cl.courseId)) continue;
        seen.add(cl.courseId);
        results.push({
          id: `${officerId}:${cl.courseId}`,
          officerId,
          courseId: cl.courseId,
          rationale: `${cl.competency.name} gap of ${gap.gapSize} level(s) (current ${gap.currentLevel} → target ${gap.targetLevel}). This course targets level ${cl.targetLevel}.`,
          priority: priority++,
          course: { name: cl.course.name, source: cl.course.source, organisation: cl.course.organisation ?? '', duration: cl.course.duration ?? '' },
        });
      }
    }

    return results;
  }
}
