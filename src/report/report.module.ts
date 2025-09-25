import { Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { ReportService } from './report.service'
import { ReportController } from './report.controller'
import { TimeLog } from 'src/time-logs/entities/time-log.entity'
import { Project } from 'src/projects/entities/project.entity'
import { User } from 'src/users/entities/user.entity'
import { WorkspacesModule } from 'src/workspaces/workspaces.module'
import { Workspace } from 'src/workspaces/entities/workspace.entity'

@Module({
	imports: [
		TypeOrmModule.forFeature([TimeLog, Project, User, Workspace]),
		WorkspacesModule,
	],
	controllers: [ReportController],
	providers: [ReportService],
})
export class ReportModule {}
