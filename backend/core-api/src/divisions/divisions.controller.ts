import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { DivisionsService } from './divisions.service';

@ApiTags('Divisions')
@Controller('divisions')
export class DivisionsController {
  constructor(private readonly divisionsService: DivisionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all MoSPI divisions' })
  findAll() {
    return this.divisionsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get division by ID' })
  findOne(@Param('id') id: string) {
    return this.divisionsService.findOne(id);
  }
}
