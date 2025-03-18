import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, MinLength } from 'class-validator'

export class ResetPasswordDto {
  @ApiProperty({
    example:
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphY2tzb25AZ21haWwuY29tIiwicm9sZSI6IkFkbWluIiwiaWQiOjMsImlhdCI6MTc0MTE4MTcyMSwiZXhwIjoxNzQxMTg1MzIxfQ.28Kz5VQUkLkD-P5LLPUUID0YahXYnHJS30HkwfQZXEA',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  token: string

  @ApiProperty({
    example: 'newPassword123',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(8)
  newPassword: string
}
