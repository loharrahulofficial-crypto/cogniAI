import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateOfficerDto {
  @ApiPropertyOptional({ example: 'Priya Sharma' })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional({ example: 'priya.sharma@mospi.gov.in' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ example: 'JSO' })
  @IsString()
  @IsOptional()
  cadre?: string;

  @ApiPropertyOptional({ description: 'Division ID' })
  @IsString()
  @IsOptional()
  divisionId?: string;

  @ApiPropertyOptional({ example: '3 years' })
  @IsString()
  @IsOptional()
  tenure?: string;

  @ApiPropertyOptional({ example: 'Delhi' })
  @IsString()
  @IsOptional()
  posting?: string;
}
