import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserRole } from "src/util/role.enum";
import { UserWorkspace } from "src/workspaces/entities/user-workspace.entity";
import { Repository } from "typeorm";

@Injectable()
export class WorkspacePermissionGuard implements CanActivate {
  constructor(
        @InjectRepository(UserWorkspace)
        private userWorkspaceRepository: Repository<UserWorkspace>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const userId = request.user.id; 
    const workspaceId = request.params.id

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { 
        userId: String(userId), 
        workspaceId: workspaceId,
        role: UserRole.ADMIN
      }
    });

    if (!userWorkspace) {
      throw new ForbiddenException('You do not have permission to perform this action');
    }
    
    return true;
  }
}