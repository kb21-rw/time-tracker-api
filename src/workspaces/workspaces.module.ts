import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { WorkspacesService } from './workspaces.service'
import { WorkspacesController } from './workspaces.controller'
import { Workspace } from './entities/workspace.entity'
import { User } from '../users/entities/user.entity'
import { UserWorkspace } from './entities/user-workspace.entity'

@Module({
  imports: [TypeOrmModule.forFeature([Workspace, User, UserWorkspace])],
  controllers: [WorkspacesController],
  providers: [WorkspacesService],
  exports: [WorkspacesService],
})
export class WorkspacesModule {}
