import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export class LoginDto {
  @ApiProperty({
    example: 'kibo.mugwaneza@gmail.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @ApiProperty({
    example: 'password123',
    required: true,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(10, { message: 'Password must be at least 10 characters' })
  password: string
}
