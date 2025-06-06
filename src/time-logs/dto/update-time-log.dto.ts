import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsUUID } from 'class-validator'
import { IsNotBeforeStartTime } from '../validators/is-not-before-start-time.validator'

export class UpdateTimeLogDto {
  @ApiProperty({
    description: 'The new start time of the time log',
    type: Date,
    required: false,
  })
  @IsOptional()
  startTime?: Date

  @ApiProperty({
    description: 'The new end time of the time log',
    type: Date,
    required: false,
  })
  @IsNotBeforeStartTime('startTime', {
    message: 'End time must be after start time',
  })
  @IsOptional()
  endTime?: Date

  @ApiProperty({
    description: 'The new description of the time log',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    description: 'The new project ID associated with the time log',
    type: String,
    required: false,
  })
  @IsOptional()
  @IsUUID()
  projectId?: string
}
