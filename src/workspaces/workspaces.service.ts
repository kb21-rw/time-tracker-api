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
    if (user.roles !== UserRole.ADMIN) {
      throw new ForbiddenException(`Dear user, you can't create a workspace`)
    }
    const existingWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: String(user.id) },
      relations: ['workspace'],
    })

    if (existingWorkspace && existingWorkspace.workspace.name === name) {
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

  async getUserWorkspaces(userId: string): Promise<Workspace[] | string> {
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { userId },
      relations: ['workspace'],
    })

    return userWorkspaces.length > 0
      ? userWorkspaces.map(userWorkspace => userWorkspace.workspace)
      : `You are in zero workspaces.`
  }

  async getWorkspaceById(
    userId: string,
    workspaceId: string,
  ): Promise<Workspace> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId, workspaceId },
    })

    if (!userWorkspace) {
      throw new ForbiddenException(
        "Dear user, you don't belong in this workspace",
      )
    }

    return this.workspaceRepository.findOne({ where: { id: workspaceId } })
  }
}
