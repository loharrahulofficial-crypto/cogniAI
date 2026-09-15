import { Injectable, NotFoundException } from '@nestjs/common';
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

  async generateQuizForOfficer(officerId: string, count = 10) {
    const profiles = await this.prisma.officerCompetencyProfile.findMany({
      where: { officerId },
      include: { competency: true },
    });

    const gappedCompetencies = profiles.filter((p) => p.targetLevel > p.currentLevel);
    if (gappedCompetencies.length === 0) return { questions: [], competencyNames: {} };

    const competencyIds = gappedCompetencies.map((p) => p.competencyId);
    const assessments = await this.prisma.assessment.findMany({
      where: { competencyId: { in: competencyIds }, reviewStatus: 'APPROVED' },
      include: { competency: true },
    });

    const shuffled = assessments.sort(() => Math.random() - 0.5).slice(0, count);
    const competencyNames: Record<string, string> = {};
    for (const p of gappedCompetencies) {
      competencyNames[p.competencyId] = p.competency.name;
    }

    return { questions: shuffled, competencyNames };
  }

  async submitQuiz(dto: {
    officerId: string;
    answers: { assessmentId: string; selectedOption: number; timeTakenMs?: number }[];
    totalTimeTakenMs?: number;
  }) {
    const results: { assessmentId: string; correct: boolean; selectedOption: number; correctAnswer: number }[] = [];
    const competencyScores: Record<string, { correct: number; total: number }> = {};

    for (const answer of dto.answers) {
      const assessment = await this.prisma.assessment.findUnique({
        where: { id: answer.assessmentId },
      });
      if (!assessment) throw new NotFoundException(`Assessment ${answer.assessmentId} not found`);

      const correct = assessment.correctAnswer === answer.selectedOption;
      results.push({
        assessmentId: answer.assessmentId,
        correct,
        selectedOption: answer.selectedOption,
        correctAnswer: assessment.correctAnswer,
      });

      const key = assessment.competencyId;
      if (!competencyScores[key]) competencyScores[key] = { correct: 0, total: 0 };
      competencyScores[key].total++;
      if (correct) competencyScores[key].correct++;

      await this.prisma.quizResult.create({
        data: {
          officerId: dto.officerId,
          assessmentId: answer.assessmentId,
          score: correct ? 1 : 0,
          maxScore: 1,
          timeTakenMs: answer.timeTakenMs,
        },
      });
    }

    const totalCorrect = results.filter((r) => r.correct).length;
    const totalQuestions = results.length;
    const percentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

    const proficiencyUpdates: { competencyId: string; oldLevel: number; newLevel: number }[] = [];

    for (const [competencyId, scores] of Object.entries(competencyScores)) {
      const ratio = scores.total > 0 ? scores.correct / scores.total : 0;
      if (ratio < 0.4) continue;

      const profile = await this.prisma.officerCompetencyProfile.findUnique({
        where: { officerId_competencyId: { officerId: dto.officerId, competencyId } },
      });
      if (!profile) continue;

      const newLevel = Math.min(profile.currentLevel + 1, profile.targetLevel);
      if (newLevel === profile.currentLevel) continue;

      const oldLevel = profile.currentLevel;
      await this.prisma.officerCompetencyProfile.update({
        where: { officerId_competencyId: { officerId: dto.officerId, competencyId } },
        data: { currentLevel: newLevel, evidenceSource: 'QUIZ' },
      });

      await this.auditService.log({
        actorId: dto.officerId,
        actorRole: 'LEARNER',
        action: 'QUIZ_PROFICIENCY_UPDATE',
        entityType: 'CompetencyProfile',
        entityId: `${dto.officerId}:${competencyId}`,
        beforeState: { currentLevel: oldLevel },
        afterState: { currentLevel: newLevel, evidenceSource: 'QUIZ' },
        rationaleShown: `Proficiency updated from ${oldLevel} to ${newLevel} based on quiz performance (${scores.correct}/${scores.total} correct)`,
      });

      proficiencyUpdates.push({ competencyId, oldLevel, newLevel });
    }

    return {
      quizResult: {
        score: totalCorrect,
        maxScore: totalQuestions,
        percentage,
        results,
        proficiencyUpdates,
      },
      rationale: `Quiz completed: ${totalCorrect}/${totalQuestions} correct (${percentage}%). ${proficiencyUpdates.length} competency level(s) updated.`,
    };
  }

  async findAll() {
    return this.prisma.assessment.findMany({
      include: { competency: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
