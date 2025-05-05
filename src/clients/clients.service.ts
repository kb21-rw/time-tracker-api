import { ConflictException, Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Client } from './entities/client.entity'
import { CreateClientDto } from './dto/create-client.dto'
import { checkIfClientExists } from 'src/util/helpers'
import { UserWorkspace } from 'src/workspaces/entities/user-workspace.entity'
import { updateClientDto } from './dto/update-client.dto'

@Injectable()
export class ClientsService {
  constructor(
    @InjectRepository(Client)
    private readonly clientsRepository: Repository<Client>,
  ) {}

  async create(
    workspaceId: string,
    { name }: CreateClientDto,
  ): Promise<Client> {
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
  async findByWorkspaceId(workspaceId: string): Promise<Client[]> {
    const clients = await this.clientsRepository.find({
      where: { workspace: { id: workspaceId } },
      relations: ['workspace'],
    })

    return clients
  }

  async update(clientId: string, { name }: updateClientDto){

      const existingClient = await this.clientsRepository.findOne({
        where: {
          name,
        },
      });

      checkIfClientExists(existingClient)
      
     const client = await this.clientsRepository.findOne({
        where: { id: clientId },
        relations: ['workspace'],
      });

      client.name = name;
      await this.clientsRepository.save(client)

      return client;
  }
}
