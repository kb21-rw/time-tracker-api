import { Test, TestingModule } from '@nestjs/testing'
import { AppController } from './app.controller'
import { AppService } from './app.service'
import { AuthService } from './auth/auth.service'
import { UsersService } from './users/users.service'
import { JwtService } from '@nestjs/jwt'

describe('AppController', () => {
  let appController: AppController

  beforeEach(async () => {
    const mockAuthService = { validateUser: jest.fn(), login: jest.fn() }
    const mockUsersService = { findOne: jest.fn() }
    const mockJwtService = { sign: jest.fn() }

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: AuthService, useValue: mockAuthService },
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile()

    appController = app.get<AppController>(AppController)
  })

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!')
    })
  })
})
