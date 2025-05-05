import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { Client } from 'src/clients/entities/client.entity'
import { Workspace } from 'src/workspaces/entities/workspace.entity'
import { Project } from './entities/project.entity'
import { WorkspacesModule } from 'src/workspaces/workspaces.module'
import { AuthModule } from 'src/auth/auth.module'
import { ClientsModule } from 'src/clients/clients.module'
import { ProjectsController } from './projects.controller'
import { ProjectsService } from './projects.service'

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Workspace, Project]),
    WorkspacesModule,
    ClientsModule,
    AuthModule,
  ],
  controllers: [ProjectsController],
  providers: [ProjectsService],
  exports: [],
})
export class ProjectsModule {}
