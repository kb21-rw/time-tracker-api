import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'

export enum UserRole {
  Admin = 'Admin',
  Moderator = 'Moderator',
  User = 'User',
}

export class CreateUserDto {
  id: number

  @ApiProperty({
    example: 'rehmat.sayani@gmail.com',
    required: true,
  })
  @IsEmail()
  email: string

  @ApiProperty({
    example: 'password123',
    required: true,
  })
  @IsNotEmpty({ message: 'Please enter a password' })
  @MinLength(10)
  password: string

  @ApiProperty({ example: 'Admin|Moderator|User', required: true })
  role: UserRole
  @ApiProperty({ example: 'John doe', required: true })
  name: string
}
