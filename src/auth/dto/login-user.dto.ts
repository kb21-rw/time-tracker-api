import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty } from 'class-validator'

export class LoginUserDto {
  @ApiProperty({
    example: 'johndoe@gmail.com',
    required: true,
  })
  @IsEmail()
  @IsNotEmpty({ message: 'Email is required' })
  email: string

  @ApiProperty({
    example: 'johndoe123',
    required: true,
  })
  @IsNotEmpty({ message: 'Password is required' })
  password: string
}
