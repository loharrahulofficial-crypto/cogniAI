import { Controller, Get, Post, Put, Delete, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { OfficersService } from './officers.service';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { UpdateOfficerDto } from './dto/update-officer.dto';

@ApiTags('Officers')
@Controller('officers')
export class OfficersController {
  constructor(private readonly officersService: OfficersService) {}

  @Get()
  @ApiOperation({ summary: 'List all officers' })
  @ApiQuery({ name: 'divisionId', required: false })
  findAll(@Query('divisionId') divisionId?: string) {
    return this.officersService.findAll(divisionId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get officer by ID' })
  findOne(@Param('id') id: string) {
    return this.officersService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create officer' })
  create(@Body() dto: CreateOfficerDto) {
    return this.officersService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update officer' })
  update(@Param('id') id: string, @Body() dto: UpdateOfficerDto) {
    return this.officersService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete officer' })
  remove(@Param('id') id: string) {
    return this.officersService.remove(id);
  }
}
