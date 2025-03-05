import { Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from 'src/users/entities/user.entity'
import * as bcrypt from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Partial<User> | UnauthorizedException> {
    const user = await this.userRepository.findOne({ where: { email } })
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...userWithNoPassword } = user
      return userWithNoPassword
    } else {
      return new UnauthorizedException('Invalid Credentials')
    }
  }
  async login(user: Partial<User>): Promise<{
    user: Partial<User>
    access_token: string
  }>
 
  {
    const payload = {
      email: user?.email,
      role: user?.roles,
      id: user?.id,
    }
    if (!user?.id) {
      throw new UnauthorizedException('Invalid user data')
    }

    const { password, ...userWithoutPassword } = user

    return {
      user: userWithoutPassword,
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
    }
  }
}
