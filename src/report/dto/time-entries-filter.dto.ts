import { Transform } from 'class-transformer'
import {
	IsISO8601,
	IsInt,
	IsOptional,
	IsPositive,
	IsUUID,
	Max,
	Min,
} from 'class-validator'

export class TimeEntriesFilterQueryDto {
	@IsISO8601({ strict: true }, { message: 'startDate must be in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)' })
	@IsOptional()
	@Transform(({ value }) => (value ? new Date(value) : undefined))
	startDate?: Date

	@IsISO8601({ strict: true }, { message: 'endDate must be in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)' })
	@IsOptional()
	@Transform(({ value }) => (value ? new Date(value) : undefined))
	endDate?: Date

	@IsOptional()
	@IsInt()
	@Min(1)
	userId?: number

	@IsOptional()
	@IsUUID()
	projectId?: string

	// Placeholder for future activity support
	@IsOptional()
	@IsUUID()
	activityId?: string

	@IsOptional()
	@IsInt()
	@Min(0)
	offset?: number

	@IsOptional()
	@IsInt()
	@IsPositive()
	@Max(100)
	limit?: number
} 