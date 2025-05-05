import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty } from 'class-validator'

export class CreateProjectDto {
  @ApiProperty({
    example: 'Project Alpha',
    required: true,
  })
  @IsNotEmpty()
  name: string
}
