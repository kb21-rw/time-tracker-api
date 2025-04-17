import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Grouping1 } from '../entities/grouping1.entity'
import { Workspace } from 'src/workspaces/entities/workspace.entity'
import { CreateGrouping1Dto } from '../dto/create-grouping1.dto'
import { VerifyIfEntityExists } from 'src/util/helpers'

@Injectable()
export class Grouping1Service {
  constructor(
    @InjectRepository(Grouping1)
    private readonly grouping1Repo: Repository<Grouping1>,
    @InjectRepository(Workspace)
    private readonly workspaceRepo: Repository<Workspace>,
  ) {}

  async create(
    workspaceId: string,
    { name }: CreateGrouping1Dto,
  ): Promise<Grouping1> {
    const workspace = await this.workspaceRepo.findOne({
      where: { id: workspaceId },
    })

    const existingGrouping1 = await this.grouping1Repo.findOne({
      where: {
        name,
        workspace: { id: workspaceId },
      },
      relations: ['workspace'],
    })

    VerifyIfEntityExists(workspace, existingGrouping1)

    const Newgrouping1 = this.grouping1Repo.create({
      name,
      workspace,
    })

    await this.grouping1Repo.save(Newgrouping1)
    return Newgrouping1
  }
}
