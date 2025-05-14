import { InjectRepository } from '@nestjs/typeorm'
import { Project } from './entities/project.entity'
import { Repository } from 'typeorm'
import { CreateProjectDto } from './dto/create-project.dto'
import {
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common'
import { Logger } from '@nestjs/common'
import { Client } from 'src/clients/entities/client.entity'
import { UpdateProjectDto } from './dto/update-project.dto'

export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name)

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  @InjectRepository(Client)
  private readonly clientRepository: Repository<Client>

  async findByName(clientId: string, name: string): Promise<Project | null> {
    return this.projectRepository
      .createQueryBuilder('project')
      .where('project.client.id = :clientId', { clientId })
      .andWhere('LOWER(project.name) = LOWER(:name)', { name: name.trim() })
      .getOne()
  }

  private async checkIfExists(clientId: string, name: string) {
    const existingProject = await this.findByName(clientId, name)
    if (!existingProject) return
    throw new ConflictException(
      `Project with the name ${existingProject.name} already exists`,
    )
  }

  private async updateWithinSameClient(
    projectId: string,
    name: string,
    clientId: string,
  ): Promise<Project> {
    await this.checkIfExists(clientId, name)

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['client'],
    })

    project.name = name
    await this.projectRepository.save(project)

    return project
  }

  private async transferToNewClient(
    projectId: string,
    name: string,
    newClientId: string,
    workspaceId: string,
  ): Promise<Project> {
    const newClient = await this.clientRepository.findOne({
      where: { id: newClientId, workspace: { id: workspaceId } },
    })

    if (!newClient) {
      throw new NotFoundException(
        'The new client does not belong to the current workspace',
      )
    }

    await this.checkIfExists(newClientId, name)

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['client'],
    })

    project.name = name
    project.client = newClient
    await this.projectRepository.save(project)

    return project
  }

  async create({ name }: CreateProjectDto, clientId: string): Promise<Project> {
    await this.checkIfExists(clientId, name)

    const newProject = this.projectRepository.create({
      name,
      client: { id: clientId },
    })

    await this.projectRepository.save(newProject)
    return newProject
  }

  async findByWorkspaceId(workspaceId: string): Promise<Project[]> {
    this.logger.log(`Fetching projects for workspace: ${workspaceId}`)

    const projects = await this.projectRepository.find({
      where: { client: { workspace: { id: workspaceId } } },
      relations: ['client'],
    })

    return projects
  }

  async update(
    projectId: string,
    { name, clientId: newClientId }: UpdateProjectDto,
    currentClientId: string,
    workspaceId: string,
  ): Promise<Project> {
    if (currentClientId === newClientId) {
      return this.updateWithinSameClient(projectId, name, currentClientId)
    } else {
      return this.transferToNewClient(projectId, name, newClientId, workspaceId)
    }
  }
}
