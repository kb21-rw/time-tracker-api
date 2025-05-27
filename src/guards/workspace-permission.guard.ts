import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { UserWorkspace } from 'src/workspaces/entities/user-workspace.entity'
import { UserRole } from 'src/util/role.enum'
import { WORKSPACE_ROLES_KEY } from '../decorators/workspace-roles.decorator'
import { validate as isUUID } from 'uuid'

@Injectable()
export class WorkspacePermissionGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    @InjectRepository(UserWorkspace)
    private readonly userWorkspaceRepository: Repository<UserWorkspace>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const expectedRoles = this.reflector.get<UserRole[]>(
      WORKSPACE_ROLES_KEY,
      context.getHandler(),
    )
    if (!expectedRoles || expectedRoles.length === 0) {
      throw new ForbiddenException('No permission metadata found')
    }
    const request = context.switchToHttp().getRequest()
    const userId = request.user?.id
    const workspaceId = request.params?.workspaceId

    if (!isUUID(workspaceId)) {
      throw new BadRequestException('Invalid workspaceId format')
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        userId: String(userId),
        workspaceId: workspaceId,
      },
    })

    if (!userWorkspace || !expectedRoles.includes(userWorkspace.role)) {
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      )
    }

    return true
  }
}
