import {
  Body,
  Controller,
  HttpCode,
  Param,
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
import { WorkspacePermissionGuard } from 'src/guards/workspacePermission.guard'
import { RolesGuard } from 'src/guards/rolesGuard'
import { CreateClientDto } from './dto/create-client.dto'

@ApiTags('clients')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/clients')
@UseGuards(JwtAuthGuard)
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @UseGuards(RolesGuard, WorkspacePermissionGuard)
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
}
