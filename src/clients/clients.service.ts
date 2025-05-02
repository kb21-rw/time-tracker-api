import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Client } from './entities/client.entity'
import { Workspace } from 'src/workspaces/entities/workspace.entity'
import { CreateClientDto } from './dto/create-client.dto'
import { ensureValidClientContext } from 'src/util/helpers'
import { UserWorkspace } from 'src/workspaces/entities/user-workspace.entity'
import { updateClientDto } from './dto/update-client.dto'

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
  ) {}

  async create(
    workspaceId: string,
    { name }: CreateClientDto,
  ): Promise<Client> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    })

    const existingClient = await this.clientsRepository.findOne({
      where: {
        name,
        workspace: { id: workspaceId },
      },
      relations: ['workspace'],
    })

    ensureValidClientContext({ workspace, existingClient })

    const newClient = this.clientsRepository.create({
      name,
      workspace,
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

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        workspaceId: workspaceId,
        userId: userId,
      },
    })
    ensureValidClientContext({ workspace, userWorkspace })

    const clients = await this.clientsRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
    })

    return clients
  }

  async update(workspaceId: string, userId:string, clientId: string, updateClientDto: updateClientDto){
    const workspace = await this.workspaceRepository.findOne({
      where: {
          id: workspaceId
        }
      })
      
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
          workspaceId,
          userId
        }
      })
      
      const existingClient = await this.clientsRepository.findOne({
        where: {
          name: updateClientDto.name,
        },
      });

    ensureValidClientContext({ workspace, existingClient, userWorkspace })

     const client = await this.clientsRepository.findOne({
        where: { id: clientId },
        relations: ['workspace'],
      });

      client.name = updateClientDto.name
      await this.clientsRepository.save(client)

      return client;
  }
}
