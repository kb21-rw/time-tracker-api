// src/workspaces/entities/user-workspace.entity.ts
import {
  Entity,
  ManyToOne,
  PrimaryColumn,
  Column,
  JoinColumn,
  UpdateDateColumn,
  CreateDateColumn,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Workspace } from './workspace.entity'
import { UserRole } from '../../util/role.enum'

@Entity()
export class UserWorkspace {
  @PrimaryColumn()
  userId: string

  @PrimaryColumn()
  workspaceId: string

  @Column({ type: 'enum', enum: UserRole })
  role: UserRole

  @CreateDateColumn()
  created_at: Date

  @UpdateDateColumn()
  updated_at: Date

  @ManyToOne(() => User, user => user.userWorkspaces)
  @JoinColumn({ name: 'userId' })
  user: User

  @ManyToOne(() => Workspace, workspace => workspace.userWorkspaces)
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace
}
