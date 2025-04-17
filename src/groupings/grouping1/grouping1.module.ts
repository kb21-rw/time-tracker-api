import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Grouping1Service } from './grouping1.service'
import { Grouping1Controller } from './grouping1.controller'
import { Workspace } from 'src/workspaces/entities/workspace.entity'
import { AuthModule } from 'src/auth/auth.module'
import { Grouping1 } from '../entities/grouping1.entity'
import { UserWorkspace } from 'src/workspaces/entities/user-workspace.entity'
import { WorkspacesModule } from 'src/workspaces/workspaces.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Grouping1, Workspace, UserWorkspace]),
    WorkspacesModule,
    AuthModule,
  ],
  controllers: [Grouping1Controller],
  providers: [Grouping1Service],
  exports: [],
})
export class Grouping1Module {}
