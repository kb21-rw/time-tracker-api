import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, SelectQueryBuilder } from 'typeorm'
import { TimeLog } from 'src/time-logs/entities/time-log.entity'
import { Project } from 'src/projects/entities/project.entity'
import { User } from 'src/users/entities/user.entity'
import { TimeEntriesFilterQueryDto } from './dto/time-entries-filter.dto'
import { Workspace } from 'src/workspaces/entities/workspace.entity'

@Injectable()
export class ReportService {
	constructor(
		@InjectRepository(TimeLog)
		private readonly timeLogRepository: Repository<TimeLog>,
		@InjectRepository(Project)
		private readonly projectRepository: Repository<Project>,
		@InjectRepository(User)
		private readonly userRepository: Repository<User>,
		@InjectRepository(Workspace)
		private readonly workspaceRepository: Repository<Workspace>,
	) {}

	private applyFilters(
		qb: SelectQueryBuilder<TimeLog>,
		workspaceId: string,
		query: TimeEntriesFilterQueryDto,
	) {
		qb.leftJoin('timeLog.user', 'user')
			.leftJoin('timeLog.project', 'project')
			.leftJoin('timeLog.workspace', 'workspace')
			.where('workspace.id = :workspaceId', { workspaceId })
			.andWhere('timeLog.endTime IS NOT NULL')

		if (query.startDate) {
			qb.andWhere('timeLog.startTime >= :startDate', { startDate: query.startDate })
		}
		if (query.endDate) {
			qb.andWhere('timeLog.endTime <= :endDate', { endDate: query.endDate })
		}
		if (query.userId) {
			qb.andWhere('user.id = :userId', { userId: query.userId })
		}
		if (query.projectId) {
			qb.andWhere('project.id = :projectId', { projectId: query.projectId })
		}
		// activityId is not currently modeled; ignore gracefully
		return qb
	}

	private mapDurationHours(start: Date, end: Date): number {
		const ms = end.getTime() - start.getTime()
		return Math.round((ms / (1000 * 60 * 60)) * 100) / 100
	}

	async filterWorkspaceTimeEntries(
		workspaceId: string,
		query: TimeEntriesFilterQueryDto,
	) {
		// Workspace existence check
		const workspace = await this.workspaceRepository.findOne({ where: { id: workspaceId } })
		if (!workspace) {
			throw new NotFoundException({
				error: 'WORKSPACE_NOT_FOUND',
				message: `Workspace with ID '${workspaceId}' does not exist`,
				statusCode: 404,
			})
		}

		if (query.startDate && isNaN(query.startDate.getTime())) {
			throw new BadRequestException({
				error: 'INVALID_DATE_FORMAT',
				message: 'startDate must be in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)',
				statusCode: 400,
			})
		}
		if (query.endDate && isNaN(query.endDate.getTime())) {
			throw new BadRequestException({
				error: 'INVALID_DATE_FORMAT',
				message: 'endDate must be in ISO 8601 format (YYYY-MM-DDTHH:MM:SSZ)',
				statusCode: 400,
			})
		}
		if (query.startDate && query.endDate && query.endDate < query.startDate) {
			throw new BadRequestException({
				error: 'INVALID_DATE_RANGE',
				message: 'endDate must be after startDate',
				statusCode: 400,
			})
		}

		const limit = Math.min(query.limit || 50, 100)
		const offset = query.offset || 0

		const qb = this.timeLogRepository
			.createQueryBuilder('timeLog')
			.select([
				'timeLog.id as id',
				'timeLog.startTime as startTime',
				'timeLog.endTime as endTime',
				'timeLog.description as description',
				'user.id as userId',
				'user.fullName as userName',
				'project.id as projectId',
				'project.name as projectName',
			])

		this.applyFilters(qb, workspaceId, query)

		const total = await qb.getCount()

		const rows = await qb
			.orderBy('timeLog.startTime', 'DESC')
			.skip(offset)
			.take(limit)
			.getRawMany()

		const timeEntries = rows.map(r => ({
			userId: String(r.userId),
			userName: r.userName,
			projectId: r.projectId || null,
			projectName: r.projectName || null,
			activityId: null,
			activityName: null,
			duration: this.mapDurationHours(new Date(r.startTime), new Date(r.endTime)),
			date: new Date(r.startTime).toISOString(),
			description: r.description || '',
		}))

		return {
			workspaceId,
			dateRange: {
				startDate: query.startDate ? query.startDate.toISOString() : null,
				endDate: query.endDate ? query.endDate.toISOString() : null,
			},
			totalEntries: total,
			limit,
			offset,
			timeEntries,
		}
	}
}
