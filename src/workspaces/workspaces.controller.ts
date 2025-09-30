import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  Patch,
  Delete,
  BadRequestException,
  Query,
} from '@nestjs/common'
import { WorkspacesService } from './workspaces.service'
import { RequestWithUser } from 'src/auth/types/request-with-user'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { CreateWorkspaceDto } from 'src/workspaces/dto/create-workspace.dto'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { RolesGuard } from 'src/guards/roles-guard'
import { UpdateWorkspaceDto } from './dto/update-workspace.dto'
import { InviteUserDto } from './dto/invite-user.dto'
import { AcceptInviteDto } from './dto/accept-invite.dto'
import { WorkspacePermissionGuard } from 'src/guards/workspace-permission.guard'
import { UserRole } from 'src/util/role.enum'
import { WorkspaceRoles } from 'src/decorators/workspace-roles.decorator'
import { Public } from '../decorators/public.decorator'
import { makeUserAnAdminDto } from './dto/make-user-an-admin.dto'
import { RemoveUserResponseDto } from './dto/remove-user-response.dto'
import { AuditLogQueryDto } from './dto/audit-log-query.dto'
import { AuditLogResponseDto, AuditLogListResponseDto } from './dto/audit-log-response.dto'
import { WorkspaceReportQueryDto, WorkspaceReportResponseDto } from './dto/report.dto'

@ApiTags('Workspaces')
@ApiBearerAuth()
@Controller('workspaces')
@UseGuards(JwtAuthGuard)
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @UseGuards(RolesGuard)
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new workspace' })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        message: 'Workspace created successfully',
        workspace: {
          id: 1,
          name: 'Development Team',
          ownerId: 5,
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
    description: "Dear user, you can't create a workspace",
  })
  @ApiResponse({
    status: 409,
    description: 'A workspace with the same name already exists',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Req() req: RequestWithUser,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.create(req.user, createWorkspaceDto)
  }

  @WorkspaceRoles(UserRole.ADMIN, UserRole.MEMBER)
  @Get()
  @ApiOperation({ summary: 'Get all workspaces of the authenticated user' })
  @ApiResponse({
    status: 200,
    schema: {
      example: [
        {
          id: 1,
          name: 'Development Team',
          ownerId: 5,
        },
        {
          id: 2,
          name: 'Marketing Team',
          ownerId: 5,
        },
      ],
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  findAll(@Req() req: RequestWithUser) {
    return this.workspacesService.findByUser(req.user.id)
  }

  @UseGuards(WorkspacePermissionGuard)
  @WorkspaceRoles(UserRole.ADMIN, UserRole.MEMBER)
  @Get(':workspaceId')
  @ApiOperation({ summary: 'Get a single workspace by ID' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 1,
        name: 'Development Team',
        ownerId: 5,
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: "Dear user, you don't belong in this workspace",
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  findOne(
    @Req() req: RequestWithUser,
    @Param('workspaceId') workspaceId: string,
  ) {
    return this.workspacesService.findAvailableById(req.user.id, workspaceId)
  }

  @UseGuards(WorkspacePermissionGuard)
  @WorkspaceRoles(UserRole.ADMIN)
  @Patch(':workspaceId')
  @ApiOperation({ summary: 'Update workspace' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: '6f4108ba-460b-4a96-819e-2c14a8736928',
        name: 'TG-RP/KITABI',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Workspace not found ',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Dear user, you can not udpate this workspace',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  update(
    @Param('workspaceId') workspaceId: string,
    @Req() req: RequestWithUser,
    @Body() updatedWorkspaceDto: UpdateWorkspaceDto,
  ) {
    return this.workspacesService.update(
      workspaceId,
      updatedWorkspaceDto,
      req.user.id,
    )
  }

  @UseGuards(WorkspacePermissionGuard)
  @WorkspaceRoles(UserRole.ADMIN)
  @Post(':workspaceId/invitations')
  @HttpCode(201)
  @ApiOperation({ summary: 'Invite User to a workspace' })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        message: 'User invited successfully',
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
    description: "Dear user, you can't invite User to this workspace",
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async inviteUser(
    @Param('workspaceId') workspaceId: string,
    @Body() inviteUserToWorkspace: InviteUserDto,
    @Req() req: RequestWithUser,
  ) {
    return this.workspacesService.inviteUser(
      req.user.id,
      workspaceId,
      inviteUserToWorkspace,
    )
  }

  @Post('invitations/accept')
  @Public()
  @ApiResponse({
    status: 200,
    description: 'Invitation successfully accepted',
  })
  @ApiOperation({ summary: 'Accept a workspace invitation' })
  @ApiResponse({
    status: 400,
    description: 'Bad Request. Missing or invalid inputs.',
  })
  @ApiResponse({ status: 403, description: 'Forbidden - Token expired' })
  @ApiResponse({
    status: 404,
    description: 'Invitation or workspace not found',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async acceptInvitation(@Body() acceptInviteDto: AcceptInviteDto) {
    return this.workspacesService.acceptInvite(acceptInviteDto)
  }

  @UseGuards(WorkspacePermissionGuard)
  @WorkspaceRoles(UserRole.ADMIN)
  @Get(':workspaceId/users')
  @ApiOperation({ description: 'Get all users in the workspace' })
  @ApiResponse({ status: 200, description: 'List of users in the workspace' })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No access to workspace or token expired',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async getWorkspaceUsers(
    @Param('workspaceId') workspaceId: string,
    @Req() req: RequestWithUser,
  ) {
    return this.workspacesService.getWorkspaceUsers(workspaceId, req.user.id)
  }

  @UseGuards(WorkspacePermissionGuard)
  @WorkspaceRoles(UserRole.ADMIN)
  @Post(':workspaceId/users/make-admin')
  @ApiOperation({ summary: 'Make user an admin' })
  @ApiResponse({
    status: 200,
    description: 'User has been made an admin',
  })
  @ApiResponse({
    status: 404,
    description: "This user doesn't belong in this workspace",
  })
  @ApiResponse({
    status: 403,
    description: "Dear user, you can't make this user an admin",
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async makeUserAnAdmin(
    @Param('workspaceId') workspaceId: string,
    @Body() makeUserAnAdminDto: makeUserAnAdminDto,
  ) {
    return this.workspacesService.makeUserAnAdmin(
      makeUserAnAdminDto.userId,
      workspaceId,
    )
  }

  @UseGuards(WorkspacePermissionGuard)
  @WorkspaceRoles(UserRole.ADMIN)
  @Delete(':workspaceId/users/:userId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Remove user from workspace' })
  @ApiResponse({
    status: 200,
    description: 'User successfully removed from workspace',
    type: RemoveUserResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin permissions required or cannot remove workspace owner',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found or not a member of this workspace',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Cannot remove yourself from workspace',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error - Failed to remove user',
  })
  async removeUserFromWorkspace(
    @Param('workspaceId') workspaceId: string,
    @Param('userId') userId: string,
    @Req() req: RequestWithUser,
  ): Promise<RemoveUserResponseDto> {
    const targetUserId = parseInt(userId, 10)
    if (isNaN(targetUserId)) {
      throw new BadRequestException('Invalid user ID')
    }

    const ipAddress = req.ip || req.connection?.remoteAddress
    const userAgent = req.get('User-Agent')

    return this.workspacesService.removeUserFromWorkspace(
      req.user.id,
      workspaceId,
      targetUserId,
      ipAddress,
      userAgent,
    )
  }

  @UseGuards(WorkspacePermissionGuard)
  @WorkspaceRoles(UserRole.ADMIN)
  @Get(':workspaceId/audit-logs')
  @ApiOperation({ summary: 'Get workspace audit logs' })
  @ApiResponse({
    status: 200,
    description: 'Audit logs retrieved successfully',
    type: AuditLogListResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin permissions required',
  })
  @ApiResponse({
    status: 404,
    description: 'Workspace not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async getWorkspaceAuditLogs(
    @Param('workspaceId') workspaceId: string,
    @Query() query: AuditLogQueryDto,
  ): Promise<AuditLogListResponseDto> {
    return this.workspacesService.getAuditLogs(workspaceId, query)
  }

  @UseGuards(WorkspacePermissionGuard)
  @WorkspaceRoles(UserRole.ADMIN)
  @Get(':workspaceId/audit-logs/:logId')
  @ApiOperation({ summary: 'Get specific audit log entry' })
  @ApiResponse({
    status: 200,
    description: 'Audit log entry retrieved successfully',
    type: AuditLogResponseDto,
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Admin permissions required',
  })
  @ApiResponse({
    status: 404,
    description: 'Audit log entry not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal Server Error',
  })
  async getAuditLogById(
    @Param('workspaceId') workspaceId: string,
    @Param('logId') logId: string,
  ): Promise<AuditLogResponseDto> {
    return this.workspacesService.getAuditLogById(workspaceId, logId)
  }

@UseGuards(WorkspacePermissionGuard)
@WorkspaceRoles(UserRole.ADMIN)
@Get(':workspaceId/reports')
@ApiOperation({ summary: 'Get workspace time tracking report' })
@ApiResponse({
  status: 200,
  description: 'Workspace report retrieved successfully',
  type: WorkspaceReportResponseDto,
})
@ApiResponse({
  status: 403,
  description: 'Forbidden - Admin permissions required',
})
@ApiResponse({
  status: 404,
  description: 'Workspace not found',
})
@ApiResponse({
  status: 500,
  description: 'Internal Server Error',
})
async getWorkspaceReport(
  @Param('workspaceId') workspaceId: string,
  @Query() query: WorkspaceReportQueryDto,
  @Req() req: RequestWithUser,
): Promise<WorkspaceReportResponseDto> {
  return this.workspacesService.getWorkspaceReport(
    workspaceId,
    req.user.id,
    query,
  )
}

}
