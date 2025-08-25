import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsNumber } from 'class-validator'

export class makeUserAnAdminDto {
  @ApiProperty({
    example: 1,
    required: true,
  })
  @IsNumber()
  @IsNotEmpty()
  userId: number
}
