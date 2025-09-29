import {
  Controller,
  Get,
  Query,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { TimeEntriesFilterQueryDto } from './dto/time-entries-filter.dto';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { WorkspacePermissionGuard } from 'src/guards/workspace-permission.guard';
import { WorkspaceRoles } from 'src/decorators/workspace-roles.decorator';
import { UserRole } from 'src/util/role.enum';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, WorkspacePermissionGuard) // Class-level guards
@Controller('report')
export class ReportController {
  constructor(private readonly reportService: ReportService) {}

  @WorkspaceRoles(UserRole.ADMIN, UserRole.MEMBER)
  @Get(':workspaceId/time-entries/filter')
  @ApiOperation({ summary: 'Filter workspace time entries report' })
  @ApiResponse({
    status: 200,
    description: 'Filtered workspace time entries successfully retrieved',
  })
  @ApiResponse({ status: 400, description: 'Bad Request. Invalid inputs.' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 403, description: 'Forbidden. Insufficient permissions.' })
  @ApiResponse({ status: 404, description: 'Workspace not found' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async filterWorkspaceTimeEntries(
    @Param('workspaceId') workspaceId: string,
    @Query() query: TimeEntriesFilterQueryDto,
  ) {
    return this.reportService.filterWorkspaceTimeEntries(workspaceId, query);
  }
}

