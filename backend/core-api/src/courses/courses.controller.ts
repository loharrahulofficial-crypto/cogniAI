import { Controller, Get, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CoursesService } from './courses.service';

@ApiTags('Courses')
@Controller('courses')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'List all courses' })
  @ApiQuery({ name: 'source', required: false })
  findAll(@Query('source') source?: string) {
    return this.coursesService.findAll(source);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get course by ID' })
  findOne(@Param('id') id: string) {
    return this.coursesService.findOne(id);
  }
}
