import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CoursesService {
  constructor(private prisma: PrismaService) {}

  async findAll(source?: string) {
    const where = source ? { source } : {};
    return this.prisma.course.findMany({
      where,
      include: {
        competencies: {
          include: { competency: true },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.course.findUnique({
      where: { id },
      include: {
        competencies: {
          include: { competency: true },
        },
      },
    });
  }
}
