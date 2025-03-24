import {
  Injectable,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Workspace } from './entities/workspace.entity'
import { UserWorkspace } from './entities/user-workspace.entity'
import { User } from '../users/entities/user.entity'
import { UserRole } from '../util/role.enum'

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(UserWorkspace)
    private userWorkspaceRepository: Repository<UserWorkspace>,
  ) {}

  async createWorkspace(user: User, { name }): Promise<Workspace> {
    const existingWorkspaces = await this.userWorkspaceRepository.find({
      where: { userId: String(user.id) },
      relations: ['workspace'],
    })
    const existingWorkspace = existingWorkspaces.find(
      existingWorkspace => existingWorkspace.workspace.name === name,
    )
    if (existingWorkspace) {
      throw new ConflictException(
        `A workspace with the name ${name} already exists`,
      )
    }
    const workspace = this.workspaceRepository.create({ name })

    await this.workspaceRepository.save(workspace)

    const userWorkspace = this.userWorkspaceRepository.create({
      userId: String(user.id),
      workspaceId: workspace.id,
      role: UserRole.ADMIN,
    })

    await this.userWorkspaceRepository.save(userWorkspace)
    return workspace
  }

  async findByUser(userId: string): Promise<Workspace[] | string> {
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { userId },
      relations: ['workspace'],
    })

    return userWorkspaces.length > 0
      ? userWorkspaces.map(userWorkspace => userWorkspace.workspace)
      : `You are in zero workspaces.`
  }

  async findAvailableById(
    userId: string,
    workspaceId: string,
  ): Promise<Workspace> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId, workspaceId },
      relations: ['workspace'],
    })

    if (!userWorkspace) {
      throw new ForbiddenException(
        "Dear user, you don't belong in this workspace",
      )
    }
    return userWorkspace.workspace
  }
}
