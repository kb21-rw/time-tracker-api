import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common'
import { UserRole } from 'src/util/role.enum'

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (user.roles !== UserRole.ADMIN) {
      throw new ForbiddenException(`Dear user,You do not have permission to perform this action`)
    }

    return true
  }
}
