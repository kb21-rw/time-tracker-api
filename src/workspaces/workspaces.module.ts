import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WorkspacesService } from './workspaces.service'
import { WorkspacesController } from './workspaces.controller'
import { Workspace } from './entities/workspace.entity'
import { User } from '../users/entities/user.entity'
import { UserWorkspace } from './entities/user-workspace.entity'
import { EmailModule } from 'src/email/email.module'
import { UsersModule } from 'src/users/users.module'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from '@nestjs/config'
import { WorkspaceInvitation } from './entities/invitation.entity'

@Module({
  imports: [
    TypeOrmModule.forFeature([Workspace, User, UserWorkspace,WorkspaceInvitation]),
    JwtModule.register({}),
    ConfigModule,
    EmailModule,
    UsersModule,
  ],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
