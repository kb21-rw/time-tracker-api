import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { StartTimeEntryDto } from './dto/start-time-entry.dto'
import { IsNull, Not, Repository } from 'typeorm'
import { TimeLog } from './entities/time-log.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { ProjectsService } from 'src/projects/projects.service'
import { StopTimeEntryDto } from './dto/stop-time-entry.dto'
import { Project } from 'src/projects/entities/project.entity'
import { ManualTimeEntryDto } from './dto/manual-time-entry.dto'

@Injectable()
export class TimeLogsService {
  constructor(
    @InjectRepository(TimeLog)
    private readonly timeLogRepository: Repository<TimeLog>,
    private readonly projectsService: ProjectsService,
  ) {}

  async findActiveTimeLog(
    userId: number,
    workspaceId: string,
  ): Promise<TimeLog | null> {
    return this.timeLogRepository
      .createQueryBuilder('timeLog')
      .leftJoin('timeLog.user', 'user')
      .leftJoin('timeLog.workspace', 'workspace')
      .where('user.id = :userId', { userId })
      .andWhere('workspace.id = :workspaceId', { workspaceId })
      .andWhere('timeLog.endTime IS NULL')
      .getOne()
  }

  private validateDescriptionLength(description: string) {
    if (description.length > 3000) {
      throw new BadRequestException(
        'Description is too long, 3000 maximum characters allowed',
      )
    }
  }

  async start(
    userId: number,
    workspaceId: string,
    { description, projectId, startTime }: StartTimeEntryDto,
  ): Promise<TimeLog> {
    const activeTimeLog = await this.findActiveTimeLog(userId, workspaceId)

    if (activeTimeLog) {
      throw new ConflictException('User already has an active time log')
    }

    if (projectId) {
      await this.projectsService.findByWorkspaceOrFail(projectId, workspaceId)
    }

    description = description ? description.trim() : ''
    this.validateDescriptionLength(description)

    const newTimeLog = this.timeLogRepository.create({
      user: { id: userId },
      project: projectId ? { id: projectId } : null,
      workspace: { id: workspaceId },
      startTime,
      description,
      endTime: null,
    })
    return await this.timeLogRepository.save(newTimeLog)
  }

  async stop(
    userId: number,
    workspaceId: string,
    { endTime, description, projectId }: StopTimeEntryDto,
  ): Promise<TimeLog> {
    const activeTimeLog = await this.findActiveTimeLog(userId, workspaceId)

    if (!activeTimeLog) {
      throw new NotFoundException('No active time log to stop')
    }

    if (new Date(endTime) <= activeTimeLog.startTime) {
      throw new BadRequestException('End time must be after start time')
    }

    if (description && description.trim() !== activeTimeLog.description) {
      if (description.length > 3000) {
        throw new BadRequestException(
          'Description is too long, 3000 maximum characters allowed',
        )
      }
      activeTimeLog.description = description.trim()
    }

    if (projectId) {
      await this.projectsService.findByWorkspaceOrFail(projectId, workspaceId)

      if (!activeTimeLog.project || activeTimeLog.project.id !== projectId) {
        activeTimeLog.project = { id: projectId } as Project
      }
    }

    activeTimeLog.endTime = endTime
    return await this.timeLogRepository.save(activeTimeLog)
  }

  async getAll(userId: number, workspaceId: string): Promise<TimeLog[]> {
    return await this.timeLogRepository.find({
      where: {
        user: { id: userId },
        workspace: { id: workspaceId },
        endTime: Not(IsNull()),
      },
      relations: ['project', 'project.client'],
      order: { startTime: 'DESC' },
    })
  }

  async createManualEntry(
    userId: number,
    workspaceId: string,
    { projectId, description, startTime, endTime }: ManualTimeEntryDto,
  ): Promise<TimeLog> {
    const activeTimeLog = await this.findActiveTimeLog(userId, workspaceId)

    if (activeTimeLog) {
      throw new ConflictException('User already has an active time log')
    }

    description = description ? description.trim() : ''
    this.validateDescriptionLength(description)

    if (projectId) {
      await this.projectsService.findByWorkspaceOrFail(projectId, workspaceId)
    }

    const timeLog = this.timeLogRepository.create({
      user: { id: userId },
      project: projectId ? { id: projectId } : null,
      workspace: { id: workspaceId },
      startTime,
      endTime,
      description,
      manualEntry: true,
    })

    return await this.timeLogRepository.save(timeLog)
  }
}
