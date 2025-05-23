import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { TypeOrmModule } from '@nestjs/typeorm'

import { User } from './users/entities/user.entity'
import { UsersModule } from './users/users.module'
import { AuthModule } from './auth/auth.module'
import { EmailModule } from './email/email.module'
import { Workspace } from './workspaces/entities/workspace.entity'
import { UserWorkspace } from './workspaces/entities/user-workspace.entity'
import { WorkspacesModule } from './workspaces/workspaces.module'
import { WorkspaceInvitation } from './workspaces/entities/invitation.entity'
import { Client } from './clients/entities/client.entity'
import { ClientsModule } from './clients/clients.module'
import { Project } from './projects/entities/project.entity'
import { ProjectsModule } from './projects/projects.module'

@Module({
  imports: [
    AuthModule,
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: process.env.DB_TYPE as 'postgres',
        host: process.env.DB_HOST,
        port: parseInt(process.env.DB_PORT),
        username: process.env.DB_USERNAME,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME,
        entities: [
          User,
          Workspace,
          UserWorkspace,
          WorkspaceInvitation,
          Client,
          Project,
        ],
        synchronize: true,

        ssl:
          process.env.DB_SSL_MODE === 'require'
            ? { rejectUnauthorized: false }
            : false,
      }),
    }),
    WorkspacesModule,
    UsersModule,
    EmailModule,
    ClientsModule,
    ProjectsModule,
  ],
})
export class AppModule {}
