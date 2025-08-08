import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
import { IsDateNotInFuture } from '../validators/is-date-not-in-future.validator'

export class StartTimeEntryDto {
  @ApiProperty({
    description: 'The start time of the time log',
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  @IsDateNotInFuture({ message: 'Start time cannot be in the future' })
  startTime: Date

  @ApiProperty({
    description: 'The project ID associated with the time log',
    example: '38b667db-59a3-4117-b057-0d0f6e5619e7',
    type: String,
  })
  @IsOptional()
  @IsUUID()
  projectId?: string

  @ApiProperty({
    description: 'The description of the time log',
    example: 'Worked on project X',
    type: String,
  })
  @IsOptional()
  @IsString()
  description?: string
}
