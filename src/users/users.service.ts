import { Injectable } from '@nestjs/common'

export type User = any

@Injectable()
export class UsersService {
  private readonly users = [
    { userId: 1, email: 'john@gmail.com', password: 'changeme' },
    { userId: 2, email: 'maria@gmail.com', password: 'guess' },
  ]

  async findByEmail(email: string): Promise<User | undefined> {
    return this.users.find(user => user.email === email)
  }
}
