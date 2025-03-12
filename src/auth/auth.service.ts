import {
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
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async validateUser(
    data: LoginUserDto,
  ): Promise<Omit<User, 'password'>> {

    const user = await this.userRepository.findOne({
      where: { email: data.email },
    })

    if (!user) {
      throw new NotFoundException("Email or password is incorrect")
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password)

    if (!isPasswordValid) {
      throw new UnauthorizedException("Email or password is incorrect")
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

 async signup(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
     const userExist = await this.userRepository.findOne({
       where: { email: createUserDto.email },
     })

     if (userExist) {
       throw new ConflictException('User already exists')
     }

     const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
     const newUser = this.userRepository.create({
       ...createUserDto,
       roles: UserRole.Admin,
       password: hashedPassword
     })

        try {
          const savedUser = await this.userRepository.save(newUser);
          const { password, ...userWithNoPassword } = savedUser;
          
          return userWithNoPassword;
        } catch (error) {
          throw error;
        }
   }
 
}
