import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DivisionsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.division.findMany({
      include: { _count: { select: { officers: true } } },
    });
  }

  async findOne(id: string) {
    return this.prisma.division.findUnique({
      where: { id },
      include: {
        officers: true,
      },
    });
  }
}
