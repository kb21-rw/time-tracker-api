import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class CreateGrouping1Dto {
  @ApiProperty({
    example: 'The gym',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string
}
