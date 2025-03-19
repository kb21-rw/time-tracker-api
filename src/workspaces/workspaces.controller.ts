import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
} from '@nestjs/common'
import { WorkspacesService } from './workspaces.service'
import { AuthGuard } from '@nestjs/passport'
import { RequestWithUser } from 'src/auth/types/request-with-user'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { CreateWorkspaceDto } from 'src/workspaces/dto/create-workspace.dto'

@ApiTags('Workspaces')
@ApiBearerAuth()
@Controller('workspaces')
@UseGuards(AuthGuard('jwt'))
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

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
  async createWorkspace(
    @Req() req: RequestWithUser,
    @Body() createWorkspaceDto: CreateWorkspaceDto,
  ) {
    return this.workspacesService.createWorkspace(req.user, createWorkspaceDto)
  }

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
    return this.workspacesService.getUserWorkspaces(req.user.id)
  }

  @Get(':id')
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
  findOne(@Req() req: RequestWithUser, @Param('id') id: string) {
    return this.workspacesService.getWorkspaceById(req.user.id, id)
  }
}
