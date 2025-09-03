import { ApiProperty } from '@nestjs/swagger'
import { AuditAction } from '../entities/workspace-audit-log.entity'

export class AuditLogResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  workspaceId: string

  @ApiProperty({ example: 42 })
  performedByUserId: number

  @ApiProperty({ example: 'John Doe' })
  performedByUserName: string

  @ApiProperty({ example: 'john.doe@example.com' })
  performedByUserEmail: string

  @ApiProperty({ example: 24, required: false })
  targetUserId?: number

  @ApiProperty({ example: 'Jane Smith', required: false })
  targetUserName?: string

  @ApiProperty({ example: 'jane.smith@example.com', required: false })
  targetUserEmail?: string

  @ApiProperty({ enum: AuditAction, example: AuditAction.USER_REMOVED })
  action: AuditAction

  @ApiProperty({ 
    example: { 
      removedUserEmail: 'jane.smith@example.com',
      removedUserName: 'Jane Smith',
      workspaceName: 'Development Team'
    },
    required: false 
  })
  metadata?: Record<string, any>

  @ApiProperty({ example: '192.168.1.100', required: false })
  ipAddress?: string

  @ApiProperty({ example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', required: false })
  userAgent?: string

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  createdAt: Date
}

export class AuditLogListResponseDto {
  @ApiProperty({ type: [AuditLogResponseDto] })
  logs: AuditLogResponseDto[]

  @ApiProperty({ example: 150 })
  total: number

  @ApiProperty({ example: 1 })
  page: number

  @ApiProperty({ example: 50 })
  limit: number

  @ApiProperty({ example: 3 })
  totalPages: number
}
