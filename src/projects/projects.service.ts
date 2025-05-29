import { InjectRepository } from '@nestjs/typeorm'
import { Project } from './entities/project.entity'
import { Repository } from 'typeorm'
import { CreateProjectDto } from './dto/create-project.dto'
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common'
import { Logger } from '@nestjs/common'
import { UpdateProjectDto } from './dto/update-project.dto'
import { isUUID } from 'class-validator'

export class ProjectsService {
  private readonly logger = new Logger(ProjectsService.name)

  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findOrFail(
    id: string,
    clientOrWorkspaceId: string,
    type: 'client' | 'workspace' = 'client',
  ): Promise<Project> {
    if (!isUUID(id)) {
      throw new BadRequestException('Invalid projectId format')
    }

    let whereClause: Record<string, any>
    if (type === 'client') {
      whereClause = { id, client: { id: clientOrWorkspaceId } }
    } else {
      whereClause = { id, client: { workspace: { id: clientOrWorkspaceId } } }
    }

    const project = await this.projectRepository.findOne({
      where: whereClause,
      relations: ['client', 'client.workspace'],
    })

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    return project
  }

  async findByName(clientId: string, name: string): Promise<Project | null> {
    return this.projectRepository
      .createQueryBuilder('project')
      .where('project.client.id = :clientId', { clientId })
      .andWhere('LOWER(project.name) = LOWER(:name)', { name: name.trim() })
      .getOne()
  }

  private async checkIfExists(
    clientId: string,
    name: string,
    excludeId?: string,
  ) {
    const existingProject = await this.findByName(clientId, name)

    if (!existingProject) return

    if (excludeId && excludeId === existingProject.id) return

    throw new ConflictException(
      `Project with the name ${existingProject.name} already exists`,
    )
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

  async findProjectInWorkspace(
    workspaceId: string,
    projectId: string,
  ): Promise<Project | null> {
    return this.projectRepository.findOne({
      where: {
        id: projectId,
        client: { workspace: { id: workspaceId } },
      },
      relations: ['client', 'client.workspace'],
    })
  }

  async update(
    projectId: string,
    { name, newClientId }: UpdateProjectDto,
    currentClientId: string,
  ): Promise<Project> {
    const project = await this.findOrFail(projectId, currentClientId)

    const clientId = newClientId || currentClientId
    await this.checkIfExists(clientId, name, project.id)

    project.name = name
    project.client.id = clientId
    await this.projectRepository.save(project)

    return project
  }
}
