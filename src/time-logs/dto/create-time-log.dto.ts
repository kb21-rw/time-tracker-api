import { ApiProperty } from "@nestjs/swagger"
import { IsNotEmpty, IsUUID } from "class-validator"

export class CreateTimeLogDto {
  @ApiProperty({
    description: 'The project ID associated with the time log',
    example: '38b667db-59a3-4117-b057-0d0f6e5619e7',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  projectId: string

  @ApiProperty({
    description: 'The user ID associated with the time log',
    example: 2,
    type: Number,
    required: true,
  })
  @IsNotEmpty()
  userId: number

  @ApiProperty({
    description: 'The start time of the time log',
    type: Date,
    required: true,
  })
  @IsNotEmpty()
  startTime: Date

  @ApiProperty({
    description: 'The description of the time log',
    example: 'Worked on project X',
    type: String,
    required: true,
  })
  @IsNotEmpty()
  description: string
}
