import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CompetenciesService } from './competencies.service';

@ApiTags('Competencies')
@Controller('competencies')
export class CompetenciesController {
  constructor(private readonly competenciesService: CompetenciesService) {}

  @Get()
  @ApiOperation({ summary: 'List all competencies' })
  @ApiQuery({ name: 'category', required: false, enum: ['BEHAVIOURAL', 'DOMAIN', 'FUNCTIONAL'] })
  findAll(@Query('category') category?: string) {
    return this.competenciesService.findAll(category);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get competency by ID' })
  findOne(@Param('id') id: string) {
    return this.competenciesService.findOne(id);
  }
}
