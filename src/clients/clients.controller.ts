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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard'
import { ClientsService } from './clients.service'
import { WorkspacePermissionGuard } from 'src/guards/workspace-permission.guard'
import { ClientDto } from './dto/client.dto'
import { WorkspaceRoles } from '../decorators/workspace-roles.decorator'
import { UserRole } from 'src/util/role.enum'
import { ClientWorkspacePermissionGuard } from 'src/guards/client-workspace-permission.guard'

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
    status: 409,
    description: 'A client with the same name already exists',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async create(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: ClientDto,
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
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async findAll(@Param('workspaceId') workspaceId: string) {
    return this.clientsService.findByWorkspaceId(workspaceId)
  }

  @WorkspaceRoles(UserRole.ADMIN)
  @UseGuards(ClientWorkspacePermissionGuard)
  @Patch(':clientId')
  @ApiOperation({ summary: 'Update client' })
  @ApiResponse({
    status: 200,
    schema: {
      example: {
        id: 'fjfkafkfa...',
        name: 'The Gym',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Client not found ',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to update this client',
  })
  @ApiResponse({
    status: 409,
    description: 'A client with the same name already exists',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  update(
    @Param('workspaceId') _workspaceId: string,
    @Param('clientId') clientId: string,
    @Body() updateClientDto: ClientDto,
  ) {
    return this.clientsService.update(clientId, updateClientDto)
  }
}
