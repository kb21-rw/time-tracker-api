import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { ProjectsService } from './projects.service'
import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { WorkspacePermissionGuard } from 'src/guards/workspacePermission.guard'
import { WorkspaceRoles } from 'src/decorators/workspace-roles.decorator'
import { UserRole } from 'src/util/role.enum'
import { CreateProjectDto } from './dto/create-project.dto'
import { ClientWorkspacePermissionGuard } from 'src/guards/client-workspace-permission.guard'

@ApiTags('Projects')
@UseGuards(
  JwtAuthGuard,
  WorkspacePermissionGuard,
  ClientWorkspacePermissionGuard,
)
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/clients/:clientId/projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @WorkspaceRoles(UserRole.ADMIN)
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new project' })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        message: 'New project created successfully',
        project: {
          id: 'fjfkafkfa...',
          name: 'Typing skills',
          clientId: '9fhfja8jfjakl_...',
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: "Dear user, you can't create a new project",
  })
  @ApiResponse({
    status: 404,
    description: 'Workspace or client not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'A project with the same name already exists',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Param('workspaceId') _workspaceId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(dto)
  }
}
