import { ApiProperty } from '@nestjs/swagger'
import { IsString, IsNotEmpty } from 'class-validator'

export class CreateWorkspaceDto {
  @ApiProperty({
    example: 'TGxAUCA Cohort 1',
    required: true,
  })
  @IsString()
  @IsNotEmpty()
  name: string
}
