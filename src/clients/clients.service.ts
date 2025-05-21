import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Client } from './entities/client.entity'
import { ClientDto } from './dto/client.dto'
import { isUUID } from 'class-validator'

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}
  async findOrFail(id: string, workspaceId: string): Promise<Client> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid clientId format')
    }
    const client = await this.clientsRepository.findOne({
      where: { id, workspace: { id: workspaceId } },
      relations: ['workspace'],
    })

    if (!client) {
      throw new ConflictException('Client not found')
    }

    return client
  }

  async findByName(workspaceId: string, name: string): Promise<Client | null> {
    return this.clientsRepository
      .createQueryBuilder('client')
      .where('LOWER(client.name) = LOWER(:name)', { name: name.trim() })
      .andWhere('client.workspace.id = :workspaceId', { workspaceId })
      .getOne()
  }

  private async checkIfExists(workspaceId: string, name: string) {
    const existingClient = await this.findByName(workspaceId, name)
    if (!existingClient) return true

    throw new ConflictException(
      `Client with the name ${existingClient.name} already exists`,
    )
  }

  async create(workspaceId: string, { name }: ClientDto): Promise<Client> {
    await this.checkIfExists(workspaceId, name)

    const newClient = this.clientsRepository.create({
      name,
      workspace: { id: workspaceId },
    })

    await this.clientsRepository.save(newClient)
    return newClient
  }
  async findByWorkspaceId(workspaceId: string): Promise<Client[]> {
    const clients = await this.clientsRepository.find({
      where: { workspace: { id: workspaceId } },
    })

    return clients
  }

  async update(clientId: string, { name }: ClientDto, workspaceId: string) {
    const client = await this.findOrFail(clientId, workspaceId)

    await this.checkIfExists(workspaceId, name)

    client.name = name
    await this.clientsRepository.save(client)

    return client
  }
}
