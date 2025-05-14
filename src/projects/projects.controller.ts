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
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { WorkspacePermissionGuard } from 'src/guards/workspace-permission.guard'
import { WorkspaceRoles } from 'src/decorators/workspace-roles.decorator'
import { UserRole } from 'src/util/role.enum'
import { CreateProjectDto } from './dto/create-project.dto'
import { ClientWorkspacePermissionGuard } from 'src/guards/client-workspace-permission.guard'
import { ProjectClientPermissionGuard } from 'src/guards/project-client-permission.guard'
import { UpdateProjectDto } from './dto/update-project.dto'

@ApiTags('Projects')
@UseGuards(JwtAuthGuard, WorkspacePermissionGuard)
@ApiBearerAuth()
@Controller('workspaces/:workspaceId')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @UseGuards(ClientWorkspacePermissionGuard)
  @WorkspaceRoles(UserRole.ADMIN)
  @Post('clients/:clientId/projects')
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
    status: 409,
    description: 'A project with the same name already exists',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Param('workspaceId') _workspaceId: string,
    @Param('clientId') clientId: string,
    @Body() dto: CreateProjectDto,
  ) {
    return this.projectsService.create(dto, clientId)
  }

  @WorkspaceRoles(UserRole.ADMIN, UserRole.MEMBER)
  @Get('projects')
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all projects of the authenticated user' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        projects: [
          {
            id: 'fjfkafkfa...',
            name: 'Project Alpha',
          },
        ],
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: "Dear user, you can't access these projects",
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAll(@Param('workspaceId') workspaceId: string) {
    return this.projectsService.findByWorkspaceId(workspaceId)
  }

  @WorkspaceRoles(UserRole.ADMIN)
  @UseGuards(ProjectClientPermissionGuard, ClientWorkspacePermissionGuard)
  @Patch('clients/:clientId/projects/:projectId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update a project' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        message: 'Project updated successfully',
        project: {
          id: 'fjfkafkfa...',
          name: 'Updated Project Name',
          clientId: 'newClientId...',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden to update this project',
  })
  @ApiResponse({
    status: 409,
    description:
      'A project with the same name already exists under the selected client',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async update(
    @Param('workspaceId') workspaceId: string,
    @Param('clientId') clientId: string,
    @Param('projectId') projectId: string,
    @Body() dto: UpdateProjectDto,
  ) {
    return this.projectsService.update(projectId, dto, clientId, workspaceId)
  }
}
