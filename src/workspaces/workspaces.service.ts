import { Injectable, ForbiddenException, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common'
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
    private authService: AuthService
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

  async findByUser(userId: string): Promise<Workspace[] | string> {
    const userWorkspaces = await this.userWorkspaceRepository.find({
      where: { userId },
      relations: ['workspace'],
    })

    return userWorkspaces.length > 0
      ? userWorkspaces.map(userWorkspace => userWorkspace.workspace)
      : `You are in zero workspaces.`
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

  async update(userId:string, workspaceId:string, updateWorkspaceDto: UpdateWorkspaceDto){


    const workspace = await this.workspaceRepository.findOne({
        where: {
          id: workspaceId
        }
    })

    if(!workspace){
      throw new NotFoundException("Workspace not found")
    }

    const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        userId,
        workspaceId
      }
    })

    if(!userWorkspace) {
      throw new ForbiddenException('Dear User you are not allowed to edit this workspace')
    }


    await this.workspaceRepository.update({id: workspaceId},{name: updateWorkspaceDto.name})
    return await this.workspaceRepository.findOne({
      where: {
        id:workspaceId
    }})
  }

  async inviteUser(userId: string,workspaceId: string, payload:InviteUserDto){
     const workspace = await this.workspaceRepository.findOne({
        where: {
          id: workspaceId
        }
    })

    if(!workspace){
      throw new NotFoundException("Workspace not found")
    }

    // Check if you are the owner of the workspace 

      const userWorkspace = await this.userWorkspaceRepository.findOne({
      where: {
        userId,
        workspaceId,
        role: UserRole.ADMIN
      }
    })

    if(!userWorkspace) {
      throw new ForbiddenException('Dear User you are not allowed to Invite User to this workspace')
    }


    // Check if invited email is not admin

    const adminUser = await this.userService.findOne(parseInt(userId))

    if( adminUser && adminUser.email === payload.email){
      throw new BadRequestException('You cannot invite yourself to a workspace')
    }

    const existingUser = await this.userService.findByEmail(payload.email)

    if(existingUser) {
      // Check if user exist in this workspace
      const existingMember = await this.userWorkspaceRepository.findOne({
        where: {
          userId: String(existingUser.id),
          workspaceId
        }
      })

      if(existingMember) {
        throw new ConflictException('This user already exist in this workspace')
      }
    }

    const {email,fullName} = payload
    const inviteToken = this.jwtService.sign({email,fullName}, {
      secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET'),
      expiresIn: `${this.configService.get('JWT_VERIFICATION_TOKEN_EXPIRATION_TIME') || '900'}s`, // Default to 15 minutes
    })

    const invitation = this.invitationRepository.create({
      fullName: payload.fullName,
      email: payload.email,
      token: inviteToken,
      workspaceId
    })

    await this.invitationRepository.save(invitation);

    this.emailService.invitationEmail(workspace.name, invitation)

    return { message: 'Invitation send successfully'}
  }

  async acceptInvite(acceptInviteDto: AcceptInviteDto){
     try{

       const payload = this.jwtService.verify(acceptInviteDto.token,{
         secret: this.configService.get('JWT_VERIFICATION_TOKEN_SECRET')
       })

       const invitation = await this.invitationRepository.findOne({where: {token: acceptInviteDto.token}})

       let existingUser = await this.authService.findByEmail(invitation.email)
       let user;
       if(!existingUser){

           if(!acceptInviteDto.password){
            throw new BadRequestException('Password is required')
           }

           const newUser = {
            email: invitation.email,
            fullName: invitation.fullName,
            password: acceptInviteDto.password
           }
    
           user = await this.authService.signup(newUser,UserRole.MEMBER)
       } else {
        user = existingUser
       }

     const userWorkspace = this.userWorkspaceRepository.create({
      userId: String(user.id),
      workspaceId: invitation.workspaceId,
      role: UserRole.MEMBER,
    });

    await this.userWorkspaceRepository.save(userWorkspace)

    await this.invitationRepository.delete(invitation)

    return { message: 'Invitation successful accepted'}
     } catch(error){
      if (error.name === 'TokenExpiredError') {
      throw new ForbiddenException('Invitation token has expired')
    }
     throw error
     }
  }
}
