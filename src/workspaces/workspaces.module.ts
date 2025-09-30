
import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WorkspacesService } from './workspaces.service'
import { WorkspacesController } from './workspaces.controller'
import { Workspace } from './entities/workspace.entity'
import { UserWorkspace } from './entities/user-workspace.entity'
import { WorkspaceInvitation } from './entities/invitation.entity'
import { User } from '../users/entities/user.entity'
import { WorkspaceAuditLog } from './entities/workspace-audit-log.entity'
import { TimeLog } from 'src/time-logs/entities/time-log.entity' // <-- ADD THIS
import { JwtModule } from '@nestjs/jwt'
import { EmailModule } from 'src/email/email.module'
import { UsersModule } from 'src/users/users.module'
import { AuthModule } from 'src/auth/auth.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Workspace,
      UserWorkspace,
      WorkspaceInvitation,
      User,
      WorkspaceAuditLog,
      TimeLog, 
    ]),
    JwtModule,
    EmailModule,
    UsersModule,
    AuthModule,
  ],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService, TypeOrmModule],
})
export class WorkspacesModule {}