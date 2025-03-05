import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create-user.dto'
import { UpdateUserDto } from './dto/update-user.dto'
import { UserRole } from 'src/util/role.enum'
import { InjectRepository } from '@nestjs/typeorm'
import { Exclusion, Repository } from 'typeorm'
import { User } from './entities/user.entity'
import * as bcrypt from 'bcrypt'

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  findAll(): Promise<User[]> {
    return this.usersRepository.find()
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const useExist = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    })
    if (useExist) {
      throw new ConflictException('User already exists')
    }
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10)
    const newUser = this.usersRepository.create({
      ...createUserDto,
      roles: UserRole.Admin,
      password: hashedPassword
    })
    try {
      return this.usersRepository.save(newUser)
    } catch (error) {
      throw error
    }
  }

  findOne(id: number) {
   const user = this.usersRepository.findOne({where : { id }})
    if(!user){
      throw new NotFoundException('User not found')
    }
     return user
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return this.usersRepository.delete(id)
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return this.usersRepository.findOne({where: {email}})
  }
}
