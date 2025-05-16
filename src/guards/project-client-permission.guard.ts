import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { isUUID } from 'class-validator'
import { Project } from 'src/projects/entities/project.entity'
import { Repository } from 'typeorm'

@Injectable()
export class ProjectClientPermissionGuard implements CanActivate {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { clientId, projectId } = request.params

    if (!isUUID(projectId)) {
      throw new ForbiddenException('Invalid projectId format')
    }

    const project = await this.projectRepository.findOne({
      where: { id: projectId },
      relations: ['client'],
    })

    if (!project || project.client.id !== clientId) {
      throw new ForbiddenException(
        'The provided project does not belong to the specified client',
      )
    }

    return true
  }
}
