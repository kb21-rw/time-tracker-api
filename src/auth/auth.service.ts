import {
  BadRequestException,
  ConflictException,
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
import { CreateUserDto } from 'src/users/dto/create-user.dto'
import { UserRole } from 'src/util/role.enum'
import { plainToInstance } from 'class-transformer'
import { ForgotPasswordDto } from './dto/forgot-password-dto'
import { EmailService } from 'src/email/email.service'
import { ResetPasswordDto } from './dto/reset-passoword-dto'
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async validateUser(data: LoginUserDto): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { email: data.email },
    })

    if (!user) {
      throw new NotFoundException(
        'Invalid credentials: check your email or password',
      )
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException(
        'Invalid credentials: check your email or password',
      )
    }

    const { password, ...userWithNoPassword } = user
    return userWithNoPassword
  }

  async login(data: LoginUserDto): Promise<{
    user: Partial<User>
    access_token: string
  }> {
    const user = await this.validateUser(data)

    const payload = {
      email: user?.email,
      role: user?.roles,
      id: user?.id,
    }

    return {
      user,
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
      }),
    }
  }

  async signup(createUserDto: CreateUserDto, role: UserRole = UserRole.ADMIN): Promise<Omit<User, 'password'>> {
    const userExist = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    })

    if (userExist) {
      throw new ConflictException('User already exists')
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    const newUser = this.userRepository.create({
      ...createUserDto,
      roles: role,
      password: hashedPassword,
    })

    const savedUser = await this.userRepository.save(newUser)
    const { password, ...userWithNoPassword } = savedUser

    return userWithNoPassword
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto) {
    const user = await this.userRepository.findOne({
      where: { email: forgotPasswordDto.email },
    })

    if (!user) {
      throw new NotFoundException(`No user found for This email`)
    }

    await this.emailService.sendResetPasswordLink(user.email, user.id)
    return {
      message:
        'If your email is registered, you will receive a password reset link',
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<{ message: string }> {
    try {
      const payload = this.jwtService.verify(resetPasswordDto.token, {
        secret: process.env.JWT_VERIFICATION_TOKEN_SECRET,
      })

      const user = await this.userRepository.findOne({
        where: { id: payload.userId, email: payload.email },
      })

      if (!user) {
        throw new NotFoundException('User not found')
      }

      // Hash the new password
      const hashedPassword = await bcrypt.hash(resetPasswordDto.newPassword, 10)

      // Update user's password
      user.password = hashedPassword
      await this.userRepository.save(user)

      return { message: 'Password successfully reset' }
    } catch (error) {
      throw new BadRequestException('Invalid or expired token')
    }
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.userRepository.findOne({where: {email}})
  }
}
