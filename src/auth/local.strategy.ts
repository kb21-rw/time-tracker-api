import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { AuthService } from '../auth/auth.service'
import { Strategy } from 'passport-local'
import { LoginUserDto } from './dto/login-user.dto'

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
    })
  }

  async validate(data: LoginUserDto) {
    return await this.authService.validateUser(data)
  }
}
