import { InjectRepository } from '@nestjs/typeorm'
import { Project } from './entities/project.entity'
import { Repository } from 'typeorm'
import { CreateProjectDto } from './dto/create-project.dto'
import { ConflictException } from '@nestjs/common'

export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}

  async findByName(clientId: string, name: string): Promise<Project | null> {
    return this.projectRepository
      .createQueryBuilder('project')
      .where('project.client.id = :clientId', { clientId })
      .andWhere('LOWER(project.name) = LOWER(:name)', { name: name.trim() })
      .getOne()
  }

  private async checkIfExists(clientId: string, name: string) {
    const existingProject = await this.findByName(clientId, name)
    if (!existingProject) return
    throw new ConflictException(
      `Project with the name ${existingProject.name} already exists`,
    )
  }
  async create({ name }: CreateProjectDto, clientId: string): Promise<Project> {
    await this.checkIfExists(clientId, name)

    const newProject = this.projectRepository.create({
      name,
      client: { id: clientId },
    })

    await this.projectRepository.save(newProject)
    return newProject
  }
}
