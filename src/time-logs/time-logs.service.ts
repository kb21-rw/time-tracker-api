import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateTimeLogDto } from './dto/create-time-log.dto';
import { Repository } from 'typeorm';
import { TimeLog } from './entities/time-log.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectsService } from 'src/projects/projects.service';

@Injectable()
export class TimeLogsService {
  constructor(
    @InjectRepository(TimeLog)
    private readonly timeLogRepository: Repository<TimeLog>,
    private readonly projectsService: ProjectsService,
  ) {}

  async startTimeLog(
    workspaceId: string,
    { description, projectId, startTime, userId }: CreateTimeLogDto,
  ): Promise<TimeLog> {
    
    const startDate = new Date(startTime)
    const existingTimeLog = await this.timeLogRepository.findOne({
      where: {
        user: { id: Number(userId) },
        endDate: null,
      },
    })

    this.validateStartTimeLog(startDate, existingTimeLog)

    const project = await this.projectsService.findProjectInWorkspace(
      workspaceId,
      projectId,
    )

    if (!project) {
      throw new NotFoundException('Project not found')
    }

    const newTimeLog = this.timeLogRepository.create({
      user: { id: Number(userId) },
      project: { id: projectId },
      workspace: { id: workspaceId },
      startDate,
      description,
      endDate: null,
    })
    return await this.timeLogRepository.save(newTimeLog)
  }

  validateStartTimeLog(startTime: Date, existingTimeLog: TimeLog | null) {
    const now = new Date()
    if (startTime > now) {
      throw new BadRequestException('Start time cannot be in the future')
    }

    if (existingTimeLog) {
      throw new ConflictException('User already has an active time log')
    }
  }
}
