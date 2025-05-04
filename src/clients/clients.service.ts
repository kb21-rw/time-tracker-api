import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Client } from './entities/client.entity'
import { Workspace } from 'src/workspaces/entities/workspace.entity'
import { CreateClientDto } from './dto/create-client.dto'
import { checkIfClientExists, validateWorkspace } from 'src/util/helpers'

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
  ) {}

  async create(
    workspaceId: string,
    { name }: CreateClientDto,
  ): Promise<Client> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    })

    validateWorkspace(workspace)

    const existingClient = await this.clientsRepository.findOne({
      where: {
        name,
        workspace: { id: workspaceId },
      },
      relations: ['workspace'],
    })

    checkIfClientExists(existingClient)

    const newClient = this.clientsRepository.create({
      name,
      workspace: { id: workspaceId },
    })

    await this.clientsRepository.save(newClient)
    return newClient
  }
  async findByWorkspaceId(
    workspaceId: string,
    userId: string,
  ): Promise<Client[]> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    })

    validateWorkspace(workspace)

    const clients = await this.clientsRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
    })

    return clients
  }
}
