import { Transform, Type } from 'class-transformer';
import {
  IsISO8601,
  IsInt,
  IsOptional,
  IsPositive,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class TimeEntriesFilterQueryDto {
  @ApiPropertyOptional({ example: '2025-09-01T00:00:00Z' })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  startDate?: Date;

  @ApiPropertyOptional({ example: '2025-09-30T23:59:59Z' })
  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  endDate?: Date;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number;

  @ApiPropertyOptional({ example: 'abcd1234-5678-90ef-ghij-klmnopqrstuv' })
  @IsOptional()
  @IsUUID()
  projectId?: string;


  @ApiPropertyOptional({ example: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  offset?: number;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  @Max(100)
  limit?: number;
}



