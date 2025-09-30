// src/workspaces/dto/workspace-report.dto.ts
import { IsOptional, IsDateString, IsEnum } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export enum ReportGroupBy {
  USER = 'user',
  PROJECT = 'project',
}

export class WorkspaceReportQueryDto {
  @ApiPropertyOptional({
    description: 'Start date for the report period (ISO 8601 format)',
    example: '2024-09-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({
    description: 'End date for the report period (ISO 8601 format)',
    example: '2024-09-30T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional({
    description: 'Filter by specific user ID',
    example: 5,
  })
  @IsOptional()
  userId?: number

  @ApiPropertyOptional({
    description: 'Group results by user or project',
    enum: ReportGroupBy,
    default: ReportGroupBy.USER,
  })
  @IsOptional()
  @IsEnum(ReportGroupBy)
  groupBy?: ReportGroupBy
}

export class ProjectTimeDto {
  projectId: string
  projectName: string
  activities: Array<{
    activityName: string
    duration: string // Format: HH:MM:SS
    durationInSeconds: number
  }>
  totalDuration: string // Format: HH:MM:SS
  totalDurationInSeconds: number
}

export class UserReportDto {
  userId: number
  userName: string
  userEmail: string
  projects: ProjectTimeDto[]
  totalDuration: string // Format: HH:MM:SS
  totalDurationInSeconds: number
}

export class WorkspaceReportResponseDto {
  workspaceId: string
  workspaceName: string
  reportPeriod: {
    startDate: string
    endDate: string
  }
  users: UserReportDto[]
  summary: {
    totalUsers: number
    totalProjects: number
    totalDuration: string // Format: HH:MM:SS
    totalDurationInSeconds: number
  }
  generatedAt: Date
}