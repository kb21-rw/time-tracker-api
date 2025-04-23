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
    private readonly clientsRepo: Repository<Client>,
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
  ) {}

  async create(
    workspaceId: string,
    { name }: CreateClientDto,
  ): Promise<Client> {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    })

    const existingClients = await this.clientsRepo.findOne({
      where: {
        name,
        workspace: { id: workspaceId },
      },
      relations: ['workspace'],
    })

    VerifyIfEntityExists(workspace, existingClients)

    const newClient = this.clientsRepo.create({
      name,
      workspace,
    })

    await this.clientsRepo.save(newClient)
    return newClient
  }
}
