import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'
import { UserWorkspace } from './user-workspace.entity'

@Entity()
export class Workspace {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @OneToMany(() => UserWorkspace, userWorkspace => userWorkspace.workspace)
  userWorkspaces: UserWorkspace[]
}
