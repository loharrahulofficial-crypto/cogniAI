import { IsString, IsEmail, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOfficerDto {
  @ApiProperty({ example: 'Priya Sharma' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'priya.sharma@mospi.gov.in' })
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'JSO' })
  @IsString()
  @IsOptional()
  cadre?: string;

  @ApiProperty({ description: 'Division ID' })
  @IsString()
  divisionId: string;

  @ApiPropertyOptional({ example: '3 years' })
  @IsString()
  @IsOptional()
  tenure?: string;

  @ApiPropertyOptional({ example: 'Delhi' })
  @IsString()
  @IsOptional()
  posting?: string;
}
