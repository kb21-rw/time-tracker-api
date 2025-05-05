import {
  Body,
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ClientsService } from './clients.service'
import { WorkspacePermissionGuard } from 'src/guards/workspacePermission.guard'
import { RolesGuard } from 'src/guards/rolesGuard'
import { CreateClientDto } from './dto/create-client.dto'
import { WorkspaceRoles } from '../decorators/workspace-roles.decorator'
import { UserRole } from 'src/util/role.enum'
import { RequestWithUser } from 'src/auth/types/request-with-user'

@ApiTags('Clients')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/clients')
@UseGuards(JwtAuthGuard, WorkspacePermissionGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @WorkspaceRoles(UserRole.ADMIN)
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new client' })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        message: 'New client created successfully',
        client: {
          id: 'fjfkafkfa...',
          name: 'The Gym',
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
    description: "Dear user, you can't create a new client",
  })
  @ApiResponse({
    status: 404,
    description: 'Workspace not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'A client with the same name already exists',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateClientDto,
  ) {
    return this.clientsService.create(workspaceId, dto)
  }

  @WorkspaceRoles(UserRole.ADMIN, UserRole.MEMBER)
  @Get()
  @HttpCode(200)
  @ApiOperation({ summary: 'Get all clients of the authenticated user' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        clients: [
          {
            id: 'fjfkafkfa...',
            name: 'The Gym',
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
    description: "Dear user, you can't access these clients",
  })
  @ApiResponse({
    status: 404,
    description: 'Workspace not found.',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAll(@Param('workspaceId') workspaceId: string) {
    return this.clientsService.findByWorkspaceId(workspaceId)
  }
}
