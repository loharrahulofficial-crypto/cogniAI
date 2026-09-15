import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { GapsService } from './gaps.service';

@ApiTags('Gaps')
@Controller('gaps')
export class GapsController {
  constructor(private readonly gapsService: GapsService) {}

  @Get('officer/:officerId')
  @ApiOperation({ summary: 'Get gaps for an officer' })
  findByOfficer(@Param('officerId') officerId: string) {
    return this.gapsService.findByOfficer(officerId);
  }

  @Get('division/:divisionId/heatmap')
  @ApiOperation({ summary: 'Get division competency heatmap' })
  getHeatmap(@Param('divisionId') divisionId: string) {
    return this.gapsService.getDivisionHeatmap(divisionId);
  }
}
