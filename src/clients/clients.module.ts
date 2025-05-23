import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ClientsService } from './clients.service'
import { ClientsController } from './clients.controller'
import { Workspace } from 'src/workspaces/entities/workspace.entity'
import { AuthModule } from 'src/auth/auth.module'
import { Client } from './entities/client.entity'
import { UserWorkspace } from 'src/workspaces/entities/user-workspace.entity'
import { WorkspacesModule } from 'src/workspaces/workspaces.module'

@Module({
  imports: [
    TypeOrmModule.forFeature([Client, Workspace, UserWorkspace]),
    WorkspacesModule,
    AuthModule,
  ],
  controllers: [ClientsController],
  providers: [ClientsService],
  exports: [ClientsService],
})
export class ClientsModule {}
