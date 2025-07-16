import {
  Controller,
  Post,
  Body,
  UseGuards,
  Param,
  Req,
  Get,
  Patch,
  Delete,
} from '@nestjs/common'
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
import { StopTimeEntryDto } from './dto/stop-time-entry.dto'
import { UpdateTimeEntryDto } from './dto/update-time-entry.dto'
import { CreateTimeEntryDto } from './dto/create-time-entry.dto'

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

  @WorkspaceRoles(UserRole.ADMIN, UserRole.MEMBER)
  @Post('stop')
  @ApiOperation({ summary: 'Stop the active time entry' })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        message: 'Time entry stopped successfully',
        timeEntry: {
          id: '1234567890',
          startTime: '2023-10-01T12:00:00Z',
          endTime: '2023-10-01T14:00:00Z',
          description: 'Finished working on project X',
          projectId: 'project123',
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
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'No active time log to stop' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async stop(
    @Body() stopDto: StopTimeEntryDto,
    @Param('workspaceId') workspaceId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.timeLogsService.stop(req.user.id, workspaceId, stopDto)
  }

  @WorkspaceRoles(UserRole.ADMIN, UserRole.MEMBER)
  @Get()
  @ApiOperation({ description: 'Get all list of time logs' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        timeLogs: [
          {
            startTime: '2025-05-29T12:58:44.352Z',
            endTime: '2025-05-29T13:40:44.352Z',
            description: 'Worked on project X',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Missing or invalid inputs.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No access to list of time logs or token expired',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getAll(
    @Param('workspaceId') workspaceId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.timeLogsService.getAll(req.user.id, workspaceId)
  }

  @WorkspaceRoles(UserRole.ADMIN, UserRole.MEMBER)
  @Get('active')
  @ApiOperation({ summary: 'Get a running time log for a given user' })
  @ApiResponse({
    status: 200,
    description: 'Active time log successfully retrieved',
    schema: {
      example: {
        timeLogs: [
          {
            startTime: '2025-05-29T12:58:44.352Z',
            endTime: '2025-05-29T13:40:44.352Z',
            description: 'Worked on project X',
          },
        ],
      },
    },
  })
  @ApiResponse({ status: 404, description: 'Active time log entry not found' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. You do not have permission to perform this action.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Missing or invalid inputs.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getActive(
    @Param('workspaceId') workspaceId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.timeLogsService.findActive(req.user.id, workspaceId)
  }

  @WorkspaceRoles(UserRole.ADMIN, UserRole.MEMBER)
  @Patch(':timeLogId')
  @ApiOperation({ summary: 'Update a time log entry' })
  @ApiResponse({
    status: 200,
    description: 'Time log entry updated successfully',
    schema: {
      example: {
        message: 'Time log entry updated successfully',
        timeLog: {
          id: '1234567890',
          startTime: '2023-10-01T12:00:00Z',
          endTime: '2023-10-01T14:00:00Z',
          description: 'Updated description for project X',
          projectId: 'project123',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Missing or invalid inputs.',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. You do not have permission to perform this action.',
  })
  @ApiResponse({
    status: 404,
    description: 'Time log entry not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async update(
    @Param('workspaceId') workspaceId: string,
    @Param('timeLogId') timeLogId: string,
    @Body() updateDto: UpdateTimeEntryDto,
    @Req() req: RequestWithUser,
  ) {
    return this.timeLogsService.update(
      timeLogId,
      workspaceId,
      req.user.id,
      updateDto,
    )
  }

  @WorkspaceRoles(UserRole.ADMIN, UserRole.MEMBER)
  @Post()
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        timeLogs: [
          {
            startTime: '2025-05-29T12:58:44.352Z',
            endTime: '2025-05-29T13:40:44.352Z',
            description: 'Worked on project X',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Missing or invalid inputs.',
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
  async create(
    @Body() createDto: CreateTimeEntryDto,
    @Param('workspaceId') workspaceId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.timeLogsService.create(req.user.id, workspaceId, createDto)
  }

  @WorkspaceRoles(UserRole.ADMIN, UserRole.MEMBER)
  @ApiOperation({ summary: 'Delete a time log entry' })
  @ApiResponse({
    status: 200,
    description: 'Time log entry deleted successfully',
  })
  @ApiResponse({ status: 404, description: 'Time log entry not found' })
  @ApiResponse({
    status: 403,
    description:
      'Forbidden. You do not have permission to perform this action.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Missing or invalid inputs.',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  @Delete(':timeLogId')
  async delete(
    @Param('workspaceId') workspaceId: string,
    @Param('timeLogId') timeLogId: string,
    @Req() req: RequestWithUser,
  ) {
    await this.timeLogsService.delete(timeLogId, workspaceId, req.user.id)
    return { statusCode: 200, message: 'Time log entry deleted successfully' }
  }
}
