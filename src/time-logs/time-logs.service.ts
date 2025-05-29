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

@Injectable()
export class TimeLogsService {
  constructor(
    @InjectRepository(TimeLog)
    private readonly timeLogRepository: Repository<TimeLog>,
    private readonly projectsService: ProjectsService,
  ) {}

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
 async GetAll(userId: number, workspaceId: string): Promise<TimeLog[]> {
  return await this.timeLogRepository.find({
    where: {
      user: { id: userId },
      workspace: { id: workspaceId },
    },
    relations: ['user', 'workspace'],
  });
}
}