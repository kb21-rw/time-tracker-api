import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  UseGuards,
  Req,
  HttpCode,
  Put,
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
import { RolesGuard } from 'src/guards/rolesGuard'
import { UpdateWorkspaceDto } from './dto/update-workspace.dto'

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
    return this.workspacesService.findAvailableById(req.user.id, id)
  }

  @Put(':id')
  update(@Param('id') id:string, @Body()updatedWorkspaceDto: UpdateWorkspaceDto){
    return this.workspacesService.update(id,updatedWorkspaceDto)
  }
}
