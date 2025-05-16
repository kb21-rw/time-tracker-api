import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID } from 'class-validator'

export class UpdateProjectDto {
  @ApiProperty({
    example: 'Project Alpha',
    required: true,
  })
  @IsNotEmpty()
  name: string

  @ApiProperty({
    example: 'ccw293jfninv-fjaiof...',
    required: true,
  })
  @IsNotEmpty()
  @IsUUID()
  newClientId: string
}
