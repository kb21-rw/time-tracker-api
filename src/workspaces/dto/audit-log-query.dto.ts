import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsEnum, IsDateString, IsNumber, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { AuditAction } from '../entities/workspace-audit-log.entity'

export class AuditLogQueryDto {
  @ApiProperty({ required: false, enum: AuditAction })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction

  @ApiProperty({ required: false, example: 42 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  performedByUserId?: number

  @ApiProperty({ required: false, example: 42 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  targetUserId?: number

  @ApiProperty({ required: false, example: '2024-01-01T00:00:00Z' })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiProperty({ required: false, example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiProperty({ required: false, example: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1

  @ApiProperty({ required: false, example: 50, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  limit?: number = 50
}
