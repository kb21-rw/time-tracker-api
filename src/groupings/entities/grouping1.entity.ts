// grouping1.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm'
import { Workspace } from '../../workspaces/entities/workspace.entity'

@Entity()
export class Grouping1 {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @ManyToOne(() => Workspace, workspace => workspace.id)
  workspace: Workspace
}
