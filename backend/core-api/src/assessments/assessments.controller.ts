import { Controller, Get, Post, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';

@ApiTags('Assessments')
@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all assessments' })
  findAll() {
    return this.assessmentsService.findAll();
  }

  @Get('review-queue')
  @ApiOperation({ summary: 'Get pending MCQ review queue' })
  findPendingReview() {
    return this.assessmentsService.findPendingReview();
  }

  @Post(':id/approve')
  @ApiOperation({ summary: 'Approve an MCQ' })
  approve(@Param('id') id: string) {
    return this.assessmentsService.approve(id, 'content-admin');
  }

  @Post(':id/reject')
  @ApiOperation({ summary: 'Reject an MCQ' })
  reject(@Param('id') id: string) {
    return this.assessmentsService.reject(id, 'content-admin');
  }

  @Get('competency/:competencyId')
  @ApiOperation({ summary: 'Get assessments by competency' })
  findByCompetency(@Param('competencyId') competencyId: string) {
    return this.assessmentsService.findByCompetency(competencyId);
  }

  @Get('quiz/:officerId')
  @ApiOperation({ summary: 'Generate quiz for officer based on gaps' })
  generateQuiz(
    @Param('officerId') officerId: string,
    @Query('count') count?: string,
  ) {
    return this.assessmentsService.generateQuizForOfficer(officerId, count ? parseInt(count, 10) : 10);
  }

  @Post('quiz/submit')
  @ApiOperation({ summary: 'Submit quiz answers' })
  submitQuiz(
    @Body() dto: { officerId: string; answers: { assessmentId: string; selectedOption: number; timeTakenMs?: number }[]; totalTimeTakenMs?: number },
  ) {
    return this.assessmentsService.submitQuiz(dto);
  }
}
