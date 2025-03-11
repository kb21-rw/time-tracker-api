import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common'

import { AppService } from './app.service'
import { AuthService } from './auth/auth.service'
import { LocalAuthGuard } from './auth/local-auth.guard'
import { JwtAuthGuard } from './auth/jwt-auth.guard'

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
  ) {}
  @Get()
  getHello(): string {
    return this.appService.getHello()
  }
}
