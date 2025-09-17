import {
  Injectable,
  ForbiddenException,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository, DataSource } from 'typeorm'
import { Workspace } from './entities/workspace.entity'
import { UserWorkspace } from './entities/user-workspace.entity'
import { User } from '../users/entities/user.entity'
import { UserRole } from '../util/role.enum'
import { UpdateWorkspaceDto } from './dto/update-workspace.dto'
import { InviteUserDto } from './dto/invite-user.dto'
import { WorkspaceInvitation } from './entities/invitation.entity'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { EmailService } from 'src/email/email.service'
import { AcceptInviteDto } from './dto/accept-invite.dto'
import { UsersService } from 'src/users/users.service'
import { AuthService } from 'src/auth/auth.service'
import { WorkspaceAuditLog, AuditAction } from './entities/workspace-audit-log.entity'
import { RemoveUserResponseDto } from './dto/remove-user-response.dto'
import { AuditLogQueryDto } from './dto/audit-log-query.dto'
import { AuditLogResponseDto, AuditLogListResponseDto } from './dto/audit-log-response.dto'

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(UserWorkspace)
    private userWorkspaceRepository: Repository<UserWorkspace>,
    @InjectRepository(WorkspaceInvitation)
    private invitationRepository: Repository<WorkspaceInvitation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(WorkspaceAuditLog)
    private auditLogRepository: Repository<WorkspaceAuditLog>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private emailService: EmailService,
    private userService: UsersService,
    private authService: AuthService,
    private dataSource: DataSource,
  ) {}

  async findByName(
    userId: string,
    name: string,
  ): Promise<UserWorkspace | null> {
    return this.userWorkspaceRepository
      .createQueryBuilder('user-workspace')
      .innerJoinAndSelect('user-workspace.workspace', 'workspace')
      .where('user-workspace.userId = :userId', { userId })
      .andWhere('LOWER(workspace.name) = LOWER(:name)', { name: name.trim() })
      .getOne()
  }

  private async checkIfExists(userId: string, name: string) {
    const existingUserWorkspace = await this.findByName(userId, name)

    if (!existingUserWorkspace) return
    throw new ConflictException(
      `Workspace with the name ${existingUserWorkspace.workspace.name} already exists`,
    )
  }
  async create(user: User, { name }): Promise<Workspace> {
    await this.checkIfExists(String(user.id), name)

    const workspace = this.workspaceRepository.create({
      name,
    })

    const savedWorkspace = await this.workspaceRepository.save(workspace)

    const userWorkspace = this.userWorkspaceRepository.create({
      userId: String(user.id),
      workspaceId: savedWorkspace.id,
      role: UserRole.ADMIN,
      isOwner: true,
    })
    if (!workspace.id) {
      throw new Error('Workspace ID is missing')
    }
    await this.userWorkspaceRepository.save(userWorkspace)
    return workspace
  }

  async findByUser(userId: string): Promise<Workspace[]> {
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { userId },
      relations: ['workspace'],
    })

    return userWorkspaces.length > 0
      ? userWorkspaces.map(userWorkspace => userWorkspace.workspace)
      : []
  }

  async findAvailableById(
    userId: string,
    workspaceId: string,
  ): Promise<Workspace> {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId, workspaceId },
      relations: ['workspace'],
    })

    if (!userWorkspace) {
      throw new ForbiddenException(
        "Dear user, you don't belong in this workspace",
      )
    }
    return userWorkspace.workspace
  }

  async update(
    workspaceId: string,
    updateWorkspaceDto: UpdateWorkspaceDto,
    userId: string,
  ) {
    await this.checkIfExists(userId, updateWorkspaceDto.name)

    await this.workspaceRepository.update(
      { id: workspaceId },
      { name: updateWorkspaceDto.name },
    )
    return await this.workspaceRepository.findOne({
      where: {
        id: workspaceId,
      },
    })
  }

  async inviteUser(userId, workspaceId: string, payload: InviteUserDto) {
    const { email } = payload

    await this.validateUser(email)

    const invitation = await this.createInvitation(workspaceId, email)

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    })

    const inviter = await this.userService.findOne(userId)

    this.emailService.sendInvitationEmail(
      workspace.name,
      invitation,
      inviter.fullName,
    )

    return { message: 'Invitation send successfully' }
  }

  private async validateUser(email: string) {
    const existingUser = await this.userService.findByEmail(email)

    if (existingUser) {
      throw new ConflictException('This user already exist in workspace')
    }
  }

  private async createInvitation(workspaceId: string, email: string) {
    const token = this.jwtService.sign(
      { email },
      {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
        expiresIn: `${this.configService.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME') || '900'}s`,
      },
    )

    const invitation = this.invitationRepository.create({
      email,
      token,
      workspaceId,
    })

    return await this.invitationRepository.save(invitation)
  }

  async acceptInvite(acceptInviteDto: AcceptInviteDto) {
    try {
      // Decode the token in case it was URL encoded
      const decodedToken = decodeURIComponent(acceptInviteDto.token)
      
      const payload = this.jwtService.verify(decodedToken, {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      })
      
      const invitation = await this.invitationRepository.findOne({
        where: { token: decodedToken },
      })

      if (!invitation) {
        throw new NotFoundException('Invitation not found')
      }

      //  Create User
      const newUser = await this.authService.signup(
        {
          email: invitation.email,
          fullName: acceptInviteDto.fullName,
          password: acceptInviteDto.password,
          timeZone: acceptInviteDto.timeZone,
        },
        UserRole.MEMBER,
      )

      // Add user in userworkspace table
      const userWorkspace = this.userWorkspaceRepository.create({
        userId: String(newUser.id),
        workspaceId: invitation.workspaceId,
        role: UserRole.MEMBER,
      })

      await this.userWorkspaceRepository.save(userWorkspace)
      return { message: 'Invitation successful accepted' }
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new ForbiddenException('Invitation token has expired')
      }
      if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid invitation token')
      }
      throw error
    }
  }

  async getWorkspaceUsers(
    workspaceId: string,
    userId: number,
  ): Promise<User[]> {
    const workspaceUsers = await this.userWorkspaceRepository.find({
      where: {
        workspaceId,
        isOwner: false,
      },
      relations: ['user'],
    })

    return workspaceUsers
      .filter(workspaceUser => workspaceUser.user.id !== userId)
      .map(workspaceUser => workspaceUser.user)
  }

  async makeUserAnAdmin(userId: number, workspaceId: string) {
    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: { userId: String(userId), workspaceId },
      relations: ['user', 'workspace'],
    })

    if (!userWorkspace) {
      throw new NotFoundException("This user doesn't belong in this workspace")
    }

    if (
      userWorkspace.role === UserRole.ADMIN &&
      userWorkspace.user.roles === UserRole.ADMIN
    ) {
      throw new BadRequestException('This user is already an admin')
    }

    userWorkspace.role = UserRole.ADMIN
    await this.updateUserRole(userId, UserRole.ADMIN)
    await this.userWorkspaceRepository.save(userWorkspace)
    const { email, fullName: userName } = userWorkspace.user

    await this.emailService.sendConfirmationEmail({
      email,
      userName,
      newRole: UserRole.ADMIN,
      workspaceName: userWorkspace.workspace.name,
    })
    return userWorkspace
  }

  async updateUserRole(userId: number, userRole: UserRole) {
    return await this.userRepository.update(userId, { roles: userRole })
  }

  async removeUserFromWorkspace(
    adminUserId: number,
    workspaceId: string,
    targetUserId: number,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<RemoveUserResponseDto> {
    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      // 1. Validate admin permissions
      const adminUserWorkspace = await queryRunner.manager.findOne(
        UserWorkspace,
        {
          where: { userId: String(adminUserId), workspaceId },
          relations: ['user', 'workspace'],
        },
      )

      if (adminUserWorkspace.role !== UserRole.ADMIN && !adminUserWorkspace.isOwner) {
        throw new ForbiddenException(
          'You do not have admin permissions for this workspace',
        )
      }

      // 2. Validate target user exists and is a workspace member
      const targetUserWorkspace = await queryRunner.manager.findOne(
        UserWorkspace,
        {
          where: { userId: String(targetUserId), workspaceId },
          relations: ['user', 'workspace'],
        },
      )

      if (!targetUserWorkspace) {
        throw new NotFoundException(
          'User not found or not a member of this workspace',
        )
      }

      // 3. Prevent removing workspace owner
      if (targetUserWorkspace.isOwner) {
        throw new ForbiddenException(
          'Cannot remove the workspace owner',
        )
      }

      // 4. Prevent self-removal (admin removing themselves)
      if (adminUserId === targetUserId) {
        throw new BadRequestException(
          'You cannot remove yourself from the workspace',
        )
      }

      const removedUser = targetUserWorkspace.user
      const workspace = targetUserWorkspace.workspace

      // 5. Remove user association from workspace
      await queryRunner.manager.delete(UserWorkspace, {
        userId: String(targetUserId),
        workspaceId,
      })

      // 6. Create audit log entry
      const auditLog = queryRunner.manager.create(WorkspaceAuditLog, {
        workspaceId,
        performedByUserId: adminUserId,
        targetUserId,
        action: AuditAction.USER_REMOVED,
        metadata: {
          removedUserEmail: removedUser.email,
          removedUserName: removedUser.fullName,
          workspaceName: workspace.name,
        },
        ipAddress,
        userAgent,
      })
      await queryRunner.manager.save(auditLog)

      // 7. Commit transaction
      await queryRunner.commitTransaction()

      // 8. Send email notifications (after successful transaction)
      try {
        // Email to removed user
        await this.emailService.sendUserRemovedNotification({
          email: removedUser.email,
          userName: removedUser.fullName,
          workspaceName: workspace.name,
          removedBy: adminUserWorkspace.user.fullName,
        })

        // Email to admin
        await this.emailService.sendUserRemovalConfirmation({
          email: adminUserWorkspace.user.email,
          adminName: adminUserWorkspace.user.fullName,
          removedUserName: removedUser.fullName,
          removedUserEmail: removedUser.email,
          workspaceName: workspace.name,
        })
      } catch (emailError) {
        // Log email errors but don't fail the operation
        console.error('Failed to send removal notification emails:', emailError)
      }

      // 9. Revoke access tokens (this would typically be handled by JWT expiration
      // or by maintaining a blacklist, but for now we'll log it)
      console.log(
        `Access tokens for user ${targetUserId} in workspace ${workspaceId} should be revoked`,
      )

      return {
        message: 'User successfully removed from workspace',
        workspaceId,
        removedUserId: targetUserId,
        removedUserEmail: removedUser.email,
        removedAt: new Date(),
      }
    } catch (error) {
      await queryRunner.rollbackTransaction()
      
      if (
        error instanceof ForbiddenException ||
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error
      }
      console.error('Remove user error:', error)
      throw new InternalServerErrorException(
        'Failed to remove user from workspace',
      )
    } finally {
      await queryRunner.release()
    }
  }

  async getAuditLogs(
    workspaceId: string,
    query: AuditLogQueryDto,
  ): Promise<AuditLogListResponseDto> {
    const queryBuilder = this.auditLogRepository
      .createQueryBuilder('audit')
      .leftJoinAndSelect('audit.performedBy', 'performedBy')
      .leftJoinAndSelect('audit.targetUser', 'targetUser')
      .where('audit.workspaceId = :workspaceId', { workspaceId })

    // Apply filters
    if (query.action) {
      queryBuilder.andWhere('audit.action = :action', { action: query.action })
    }
    
    if (query.performedByUserId) {
      queryBuilder.andWhere('audit.performedByUserId = :performedByUserId', {
        performedByUserId: query.performedByUserId,
      })
    }

    if (query.targetUserId) {
      queryBuilder.andWhere('audit.targetUserId = :targetUserId', {
        targetUserId: query.targetUserId,
      })
    }

    if (query.startDate) {
      queryBuilder.andWhere('audit.created_at >= :startDate', {
        startDate: query.startDate,
      })
    }

    if (query.endDate) {
      queryBuilder.andWhere('audit.created_at <= :endDate', {
        endDate: query.endDate,
      })
    }

    // Pagination
    const page = query.page || 1
    const limit = Math.min(query.limit || 50, 100) // Cap at 100 for performance
    const offset = (page - 1) * limit

    queryBuilder
      .orderBy('audit.created_at', 'DESC')
      .skip(offset)
      .take(limit)

    const [logs, total] = await queryBuilder.getManyAndCount()

    return {
      logs: logs.map(log => this.mapToAuditLogResponse(log)),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  async getAuditLogById(
    workspaceId: string,
    logId: string,
  ): Promise<AuditLogResponseDto> {
    const log = await this.auditLogRepository.findOne({
      where: { id: logId, workspaceId },
      relations: ['performedBy', 'targetUser'],
    })

    if (!log) {
      throw new NotFoundException('Audit log entry not found')
    }

    return this.mapToAuditLogResponse(log)
  }

  private mapToAuditLogResponse(log: WorkspaceAuditLog): AuditLogResponseDto {
    return {
      id: log.id,
      workspaceId: log.workspaceId,
      performedByUserId: log.performedByUserId,
      performedByUserName: log.performedBy?.fullName || 'Unknown User',
      performedByUserEmail: log.performedBy?.email || 'unknown@example.com',
      targetUserId: log.targetUserId,
      targetUserName: log.targetUser?.fullName,
      targetUserEmail: log.targetUser?.email,
      action: log.action,
      metadata: log.metadata,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      createdAt: log.created_at,
    }
  }
}
