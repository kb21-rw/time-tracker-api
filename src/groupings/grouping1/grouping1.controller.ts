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
import { Grouping1Service } from './grouping1.service'
import { WorkspacePermissionGuard } from 'src/guards/workspacePermission.guard'
import { RolesGuard } from 'src/guards/rolesGuard'
import { CreateGrouping1Dto } from '../dto/create-grouping1.dto'

@ApiTags('Grouping1')
@ApiBearerAuth()
@Controller('workspaces/:workspaceId/grouping1')
@UseGuards(JwtAuthGuard)
export class Grouping1Controller {
  constructor(private readonly grouping1Service: Grouping1Service) {}

  @UseGuards(RolesGuard, WorkspacePermissionGuard)
  @Post()
  @HttpCode(201)
  @ApiOperation({ summary: 'Create a new grouping 1' })
  @ApiResponse({
    status: 201,
    schema: {
      example: {
        message: 'New grouping 1 created successfully',
        grouping1: {
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
    description: "Dear user, you can't create a new grouping 1",
  })
  @ApiResponse({
    status: 404,
    description: 'Workspace not found.',
  })
  @ApiResponse({
    status: 409,
    description: 'A grouping 1 with the same name already exists',
  })
  @ApiResponse({ status: 500, description: 'Internal Server Error' })
  async createGrouping(
    @Param('workspaceId') workspaceId: string,
    @Body() dto: CreateGrouping1Dto,
  ) {
    return this.grouping1Service.create(workspaceId, dto)
  }
}
