import { InjectRepository } from '@nestjs/typeorm'
import { Project } from './entities/project.entity'
import { In, Repository } from 'typeorm'
import { Client } from 'src/clients/entities/client.entity'
import {
  checkIfProjectExists,
  validateClient,
  validateWorkspace,
} from 'src/util/helpers'
import { CreateProjectDto } from './dto/create-project.dto'
import { Workspace } from 'src/workspaces/entities/workspace.entity'

export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}
  async create(
    { name, clientId }: CreateProjectDto,
    workspaceId: string,
  ): Promise<Project> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    })

    validateWorkspace(workspace)

    const client = await this.clientRepository.findOne({
      where: { id: clientId },
      relations: ['workspace'],
    })

    validateClient(client)

    const existingProject = await this.projectRepository.findOne({
      where: {
        name,
        client: { id: clientId },
      },
      relations: ['client'],
    })

    checkIfProjectExists(existingProject)

    const newProject = this.projectRepository.create({
      name,
      client: { id: clientId },
    })

    await this.projectRepository.save(newProject)
    return newProject
  }
}
