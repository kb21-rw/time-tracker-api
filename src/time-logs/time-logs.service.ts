import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { StartTimeEntryDto } from './dto/start-time-entry.dto'
import { Repository } from 'typeorm'
import { TimeLog } from './entities/time-log.entity'
import { InjectRepository } from '@nestjs/typeorm'
import { ProjectsService } from 'src/projects/projects.service'
import { StopTimeEntryDto } from './dto/stop-time-entry.dto'
import { Project } from 'src/projects/entities/project.entity'

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

  async start(
    userId: number,
    workspaceId: string,
    { description, projectId, startTime }: StartTimeEntryDto,
  ): Promise<TimeLog> {
    const activeTimeLog = await this.timeLogRepository.findOne({
      where: {
        user: { id: Number(userId) },
        endTime: null,
      },
    })

    this.validateStartTimeLog(startTime, activeTimeLog)

    if (projectId) {
      const project = await this.projectsService.findProjectInWorkspace(
        workspaceId,
        projectId,
      )

      if (!project) {
        throw new NotFoundException('Project not found')
      }
    }

    const newTimeLog = this.timeLogRepository.create({
      user: { id: userId },
      project: projectId ? { id: projectId } : null,
      workspace: { id: workspaceId },
      startTime,
      description: description || '',
      endTime: null,
    })
    return await this.timeLogRepository.save(newTimeLog)
  }

  validateStartTimeLog(startTime: Date, activeTimeLog: TimeLog | null) {
    const now = new Date()
    if (startTime > now) {
      throw new BadRequestException('Start time cannot be in the future')
    }
    if (activeTimeLog) {
      throw new ConflictException('User already has an active time log')
    }
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
      await this.projectsService.findOrFail(projectId, workspaceId, 'workspace')

      if (!activeTimeLog.project || activeTimeLog.project.id !== projectId) {
        activeTimeLog.project = { id: projectId } as Project
      }
    }

    activeTimeLog.endTime = endTime
    return await this.timeLogRepository.save(activeTimeLog)
  }
}
