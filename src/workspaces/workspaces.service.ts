import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'
import { Workspace } from './entities/workspace.entity'
import { UserWorkspace } from './entities/user-workspace.entity'
import { User } from '../users/entities/user.entity'
import { UserRole } from '../util/role.enum'
import { verifyIfNameNotTaken } from 'src/util/helpers'
import { UpdateWorkspaceDto } from './dto/update-workspace.dto'
import { InviteUserDto } from './dto/invite-user.dto'
import { WorkspaceInvitation } from './entities/invitation.entity'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { EmailService } from 'src/email/email.service'
import { AcceptInviteDto } from './dto/accept-invite.dto'
import { UsersService } from 'src/users/users.service'
import { AuthService } from 'src/auth/auth.service'

@Injectable()
export class WorkspacesService {
  constructor(
    @InjectRepository(Workspace)
    private workspaceRepository: Repository<Workspace>,
    @InjectRepository(UserWorkspace)
    private userWorkspaceRepository: Repository<UserWorkspace>,
    @InjectRepository(WorkspaceInvitation)
    private invitationRepository: Repository<WorkspaceInvitation>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private emailService: EmailService,
    private userService: UsersService,
    private authService: AuthService,
  ) {}

  async create(user: User, { name }): Promise<Workspace> {
    const existingWorkspaces = await this.userWorkspaceRepository.find({
      where: { userId: String(user.id) },
      relations: ['workspace'],
    })
    const existingWorkspace = existingWorkspaces.find(
      existingWorkspace => existingWorkspace.workspace.name === name,
    )
    verifyIfNameNotTaken(existingWorkspace)
    const workspace = this.workspaceRepository.create({
      name,
    })

    const savedWorkspace = await this.workspaceRepository.save(workspace)

    const userWorkspace = this.userWorkspaceRepository.create({
      userId: String(user.id),
      workspaceId: savedWorkspace.id,
      role: UserRole.ADMIN,
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

  async update(workspaceId: string, updateWorkspaceDto: UpdateWorkspaceDto) {
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

  async inviteUser(workspaceId: string, payload: InviteUserDto) {
    const { email, fullName } = payload

    await this.validateUser(email)

    const invitation = await this.createInvitation(workspaceId, email, fullName)

    const workspace = await this.workspaceRepository.findOne({
      where: { id: workspaceId },
    })

    this.emailService.sendInvitationEmail(workspace.name, invitation)

    return { message: 'Invitation send successfully' }
  }

  private async validateUser(email: string) {
    const existingUser = await this.userService.findByEmail(email)

    if (existingUser) {
      throw new ConflictException('This user already exist in workspace')
    }
  }

  private async createInvitation(
    workspaceId: string,
    email: string,
    fullName: string,
  ) {
    const token = this.jwtService.sign(
      { email, fullName },
      {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
        expiresIn: `${this.configService.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME') || '900'}s`,
      },
    )

    const invitation = this.invitationRepository.create({
      fullName,
      email,
      token,
      workspaceId,
    })

    return await this.invitationRepository.save(invitation)
  }

  async acceptInvite(acceptInviteDto: AcceptInviteDto) {
    try {
      const payload = this.jwtService.verify(acceptInviteDto.token, {
        secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      })
      const invitation = await this.invitationRepository.findOne({
        where: { token: acceptInviteDto.token },
      })

      //  Create User
      const newUser = await this.authService.signup(
        {
          email: invitation.email,
          fullName: invitation.fullName,
          password: acceptInviteDto.password,
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
      throw error
    }
  }

  async getWorkspaceUsers(workspaceId:string){
    const workspaceUsers = await this.userWorkspaceRepository.find({
      where: {
        workspaceId
      },
      relations: ['user']
    })
    
    return workspaceUsers.map( w => w.user)
  }
}
