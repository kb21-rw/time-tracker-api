import { Controller, Post, Body, UseGuards, Param } from '@nestjs/common';
import { TimeLogsService } from './time-logs.service';
import { CreateTimeLogDto } from './dto/create-time-log.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { WorkspaceRoles } from 'src/decorators/workspace-roles.decorator';
import { UserRole } from 'src/util/role.enum';
import { WorkspacePermissionGuard } from 'src/guards/workspace-permission.guard';

@ApiTags('Time Logs')
@UseGuards(JwtAuthGuard, WorkspacePermissionGuard)
@ApiBearerAuth()
@Controller('workspaces/:workspaceId')
export class TimeLogsController {
  constructor(private readonly timeLogsService: TimeLogsService) {}

  @WorkspaceRoles(UserRole.ADMIN, UserRole.MEMBER)
  @Post('start')
  @ApiOperation({ summary: 'Start a new time log' })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        message: 'New time log started successfully',
        timeLog: {
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
    description: 'Conflict. User already has an active time log.',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async startTimeLog(
    @Body() createTimeLogDto: CreateTimeLogDto,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.timeLogsService.startTimeLog(workspaceId, createTimeLogDto)
  }
}
