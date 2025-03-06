import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { User } from 'src/users/entities/user.entity'
import * as bcrypt from 'bcrypt'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { LoginUserDto } from './dto/login-user.dto'
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    data: LoginUserDto,
  ): Promise<Partial<User> | UnauthorizedException> {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    })
    if (!user) {
      throw new NotFoundException("User doesn't exist")
    }
    if (await bcrypt.compare(data.password, user.password)) {
      const { password, ...userWithNoPassword } = user
      return userWithNoPassword
    } else {
      throw new UnauthorizedException("Email and password don't match")
    }
  }
  async login(user: Partial<User>): Promise<{
    user: Partial<User>
    access_token: string
  }> {
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
