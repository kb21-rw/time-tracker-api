import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Client } from './entities/client.entity'
import { Workspace } from 'src/workspaces/entities/workspace.entity'
import { CreateClientDto } from './dto/create-client.dto'
import { VerifyIfEntityExists } from 'src/util/helpers'

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

    const existingClients = await this.clientsRepository.findOne({
      where: {
        name,
        workspace: { id: workspaceId },
      },
      relations: ['workspace'],
    })

    VerifyIfEntityExists(workspace, existingClients)

    const newClient = this.clientsRepository.create({
      name,
      workspace,
    })

    await this.clientsRepository.save(newClient)
    return newClient
  }
}
