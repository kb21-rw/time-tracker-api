import { Controller, Post, Body, UseGuards, Param, Req } from '@nestjs/common'
import { TimeLogsService } from './time-logs.service'
import { StartTimeEntryDto } from './dto/start-time-entry.dto'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { WorkspaceRoles } from 'src/decorators/workspace-roles.decorator'
import { UserRole } from 'src/util/role.enum'
import { WorkspacePermissionGuard } from 'src/guards/workspace-permission.guard'
import { RequestWithUser } from 'src/auth/types/request-with-user'

@ApiTags('Time Logs')
@UseGuards(JwtAuthGuard, WorkspacePermissionGuard)
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/timeEntries')
export class TimeLogsController {
  constructor(private readonly timeLogsService: TimeLogsService) {}

  @WorkspaceRoles(UserRole.ADMIN, UserRole.MEMBER)
  @Post('start')
  @ApiOperation({ summary: 'Start a new time entry' })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        message: 'New time entry started successfully',
        timeEntry: {
          id: '1234567890',
          startTime: '2023-10-01T12:00:00Z',
          description: 'Started working on project X',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Missing or invalid inputs.',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. You do not have permission to perform this action.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict. User already has an active time entry.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async start(
    @Body() startTimeEntryDto: StartTimeEntryDto,
    @Param('workspaceId') workspaceId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.timeLogsService.start(
      req.user.id,
      workspaceId,
      startTimeEntryDto,
    )
  }
}
