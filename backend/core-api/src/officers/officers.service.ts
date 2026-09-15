import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfficerDto } from './dto/create-officer.dto';
import { UpdateOfficerDto } from './dto/update-officer.dto';

@Injectable()
export class OfficersService {
  constructor(private prisma: PrismaService) {}

  async findAll(divisionId?: string) {
    const where = divisionId ? { divisionId } : {};
    return this.prisma.officer.findMany({
      where,
      include: {
        division: true,
        competencies: {
          include: { competency: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.officer.findUnique({
      where: { id },
      include: {
        division: true,
        competencies: {
          include: { competency: true },
        },
        gapRecords: {
          include: { competency: true },
        },
      },
    });
  }

  async create(dto: CreateOfficerDto) {
    return this.prisma.officer.create({
      data: dto,
      include: { division: true },
    });
  }

  async update(id: string, dto: UpdateOfficerDto) {
    return this.prisma.officer.update({
      where: { id },
      data: dto,
      include: { division: true },
    });
  }

  async remove(id: string) {
    return this.prisma.officer.delete({ where: { id } });
  }
}
