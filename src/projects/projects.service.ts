import { InjectRepository } from '@nestjs/typeorm'
import { Project } from './entities/project.entity'
import { Repository } from 'typeorm'
import { checkIfProjectExists } from 'src/util/helpers'
import { CreateProjectDto } from './dto/create-project.dto'

export class ProjectsService {
  constructor(
    @InjectRepository(Project)
    private readonly projectRepository: Repository<Project>,
  ) {}
  async create({ name }: CreateProjectDto, clientId: string): Promise<Project> {
    const existingProject = await this.projectRepository.findOne({
      where: {
        name,
        client: { id: clientId },
      },
      relations: ['client'],
    })

    checkIfProjectExists(existingProject)

    const newProject = this.projectRepository.create({
      name,
      client: { id: clientId },
    })

    await this.projectRepository.save(newProject)
    return newProject
  }
}
