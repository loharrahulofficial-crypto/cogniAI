import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { RecommendationsService } from './recommendations.service';

@ApiTags('Recommendations')
@Controller('recommendations')
export class RecommendationsController {
  constructor(private readonly recommendationsService: RecommendationsService) {}

  @Get('officer/:officerId')
  @ApiOperation({ summary: 'Get recommendations for an officer' })
  findByOfficer(@Param('officerId') officerId: string) {
    return this.recommendationsService.findByOfficer(officerId);
  }
}
