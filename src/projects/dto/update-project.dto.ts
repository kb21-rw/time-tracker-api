import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsUUID, IsOptional } from 'class-validator'

export class UpdateProjectDto {
  @ApiProperty({
    example: 'Project Alpha',
    required: true,
  })
  @IsNotEmpty()
  name: string

  @ApiProperty({
    example: 'ccw293jfninv-fjaiof...',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  newClientId?: string
}
