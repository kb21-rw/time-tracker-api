import { Controller, Get, Query, Param, UseGuards } from '@nestjs/common'
import { ReportService } from './report.service'
import { TimeEntriesFilterQueryDto } from './dto/time-entries-filter.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { WorkspacePermissionGuard } from 'src/guards/workspace-permission.guard'
import { WorkspaceRoles } from 'src/decorators/workspace-roles.decorator'
import { UserRole } from 'src/util/role.enum'

@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class ReportController {
	constructor(private readonly reportService: ReportService) {}

	@UseGuards(WorkspacePermissionGuard)
	@WorkspaceRoles(UserRole.ADMIN, UserRole.MEMBER)
	@Get(':workspaceId/time-entries/filter')
	async filterWorkspaceTimeEntries(
		@Param('workspaceId') workspaceId: string,
		@Query() query: TimeEntriesFilterQueryDto,
	) {
		return this.reportService.filterWorkspaceTimeEntries(workspaceId, query)
	}
}
