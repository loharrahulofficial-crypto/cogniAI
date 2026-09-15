import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { HealthModule } from './health/health.module';
import { OfficersModule } from './officers/officers.module';
import { DivisionsModule } from './divisions/divisions.module';
import { CompetenciesModule } from './competencies/competencies.module';
import { CoursesModule } from './courses/courses.module';
import { GapsModule } from './gaps/gaps.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { AuditModule } from './audit/audit.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    HealthModule,
    OfficersModule,
    DivisionsModule,
    CompetenciesModule,
    CoursesModule,
    GapsModule,
    AssessmentsModule,
    RecommendationsModule,
    AuditModule,
  ],
})
export class AppModule {}
