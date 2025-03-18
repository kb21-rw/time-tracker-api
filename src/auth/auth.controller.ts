import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Request,
  HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginUserDto } from './dto/login-user.dto'
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { ForgotPasswordDto } from './dto/forgot-password-dto'
import { ResetPasswordDto } from './dto/reset-password-dto'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginUserDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: {
      example: {
        user: {
          id: 3,
          fullName: 'Jackson Eric',
          email: 'jackson@gmail.com',
          roles: 'Admin',
        },
        access_token:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImphY2tzb25AZ21haWwuY29tIiwicm9sZSI6IkFkbWluIiwiaWQiOjMsImlhdCI6MTc0MTE4MTcyMSwiZXhwIjoxNzQxMTg1MzIxfQ.28Kz5VQUkLkD-P5LLPUUID0YahXYnHJS30HkwfQZXEA',
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  login(@Body() loginRequest: LoginUserDto) {
    return this.authService.login(loginRequest)
  }

  @Post('signup')
  @HttpCode(201)
  @ApiOperation({ summary: 'Create new User' })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        message: 'User registered successfully',
        user: {
          id: 5,
          fullName: 'Christelle Gihozo',
          email: 'christelle@gmail.com',
          roles: 'Admin',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Missing or invalid inputs.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  signup(@Body() createUserDto: CreateUserDto) {
    return this.authService.signup(createUserDto)
  }

  @Post('forgot-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Forgot Password' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Reset email sent successfully',
    schema: {
      example: {
        message:
          'a password reset link was sent to your email. Please check your inbox.',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid email' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto)
  }

  @Post('reset-password')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Password reset' })
  @ApiBody({ type: ResetPasswordDto })
  @ApiResponse({
    status: 200,
    description: 'Password reset successful',
    schema: {
      example: {
        message: 'Password successfully reset',
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid Token' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto)
  }
}
