import { Injectable } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(), // Extract token from Authorization header
      ignoreExpiration: false, // Don't accept expired tokens
      secretOrKey: process.env.JWT_SECRET, // Secret key for validation
    })
  }

  async validate(payload: any) {
    return { userId: payload.sub, username: payload.username } // Attach user details to the request
  }
}
