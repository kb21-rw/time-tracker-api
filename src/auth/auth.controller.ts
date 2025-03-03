import { Controller, Post, Body, HttpCode, UseFilters } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger'
import { AuthService } from './auth.service'
import { LoginDto } from 'src/user/dto/login.dto'

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'User login' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({
    status: 200,
    description: 'Login successful',
    schema: { example: { access_token: 'jwt-token' } },
  })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 401, description: 'Incorrect password' })
  async login(@Body() loginDto: LoginDto) {
    return this.authService.validateUser(loginDto.email, loginDto.password)
  }
}
