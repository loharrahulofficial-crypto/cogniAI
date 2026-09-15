import { Controller, Get, Param, Post } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AssessmentsService } from './assessments.service';

@ApiTags('Assessments')
@Controller('assessments')
export class AssessmentsController {
  constructor(private readonly assessmentsService: AssessmentsService) {}

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
}
