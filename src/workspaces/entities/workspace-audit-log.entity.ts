import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm'
import { User } from '../../users/entities/user.entity'
import { Workspace } from './workspace.entity'

export enum AuditAction {
  USER_REMOVED = 'USER_REMOVED',
  USER_ADDED = 'USER_ADDED',
  ROLE_CHANGED = 'ROLE_CHANGED',
  WORKSPACE_CREATED = 'WORKSPACE_CREATED',
  WORKSPACE_DELETED = 'WORKSPACE_DELETED',
}

@Entity()
export class WorkspaceAuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  workspaceId: string

  @Column()
  performedByUserId: number

  @Column({ nullable: true })
  targetUserId?: number

  @Column({ type: 'enum', enum: AuditAction })
  action: AuditAction

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>

  @Column({ nullable: true })
  ipAddress?: string

  @Column({ nullable: true })
  userAgent?: string

  @CreateDateColumn()
  created_at: Date

  @ManyToOne(() => Workspace, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workspaceId' })
  workspace: Workspace

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'performedByUserId' })
  performedBy: User

  @ManyToOne(() => User, { onDelete: 'SET NULL' })
  @JoinColumn({ name: 'targetUserId' })
  targetUser?: User
}
