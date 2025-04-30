import { InjectRepository } from '@nestjs/typeorm'
import { Project } from './entities/project.entity'
import { In, Repository } from 'typeorm'
import { Client } from 'src/clients/entities/client.entity'
import {
  checkExistingProject,
  ensureClientBelongsToWorkspace,
  validateClient,
  validateUserWorkspace,
  validateWorkspace,
} from 'src/util/helpers'
import { CreateProjectDto } from './dto/create-project.dto'
import { Workspace } from 'src/workspaces/entities/workspace.entity'
import { UserWorkspace } from 'src/workspaces/entities/user-workspace.entity'

export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
    @InjectRepository(Workspace)
    private readonly workspaceRepository: Repository<Workspace>,
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
  ) {}
  async create(
    { name, clientId }: CreateProjectDto,
    workspaceId: string,
    userId: string,
  ): Promise<Project> {
    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    })

    validateWorkspace(workspace)

    const userworkspace = await this.userWorkspaceRepository.findOne({
      where: { userId, workspaceId },
      relations: ['workspace'],
    })

    validateUserWorkspace(userworkspace)

    const client = await this.clientRepository.findOne({
      where: { id: clientId },
      relations: ['workspace'],
    })

    validateClient(client)

    ensureClientBelongsToWorkspace(client, workspaceId)

    const existingProject = await this.projectRepository.findOne({
      where: {
        name,
        client: { id: clientId },
      },
      relations: ['client'],
    })

    checkExistingProject(existingProject)

    const newProject = this.projectRepository.create({
      name,
      client,
    })

    await this.projectRepository.save(newProject)
    return newProject
  }
}
