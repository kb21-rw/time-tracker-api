import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Client } from 'src/clients/entities/client.entity'
import { Repository } from 'typeorm'

@Injectable()
export class ClientWorkspacePermissionGuard implements CanActivate {
  constructor(
    @InjectRepository(Client)
    private readonly clientRepository: Repository<Client>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest()
    const { workspaceId, clientId } = request.params

    const client = await this.clientRepository.findOne({
      where: { id: clientId },
      relations: ['workspace'],
    })

    if (!client || client.workspace.id !== workspaceId) {
      throw new ForbiddenException(
        'The provided client does not belong to this workspace',
      )
    }

    return true
  }
}
