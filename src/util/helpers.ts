import { ConflictException, NotFoundException } from '@nestjs/common'
import { User } from 'src/users/entities/user.entity'
import { UserWorkspace } from 'src/workspaces/entities/user-workspace.entity'
import { Workspace } from 'src/workspaces/entities/workspace.entity'

export function verifyIfNameNotTaken(userWorkspace?: UserWorkspace) {
  if (!userWorkspace || !userWorkspace.workspace) return

  const {
    workspace: { name: existingName },
  } = userWorkspace
  if (existingName) {
    throw new ConflictException(
      `A workspace with the name ${existingName} already exists`,
    )
  }
}

export function checkIfUserExists(user:User, workspaceId:string, userWorkspaceRepository){
   if(user) {
      // Check if user exist in this workspace
      const existingMember = userWorkspaceRepository.findOne({
        where: {
          userId: String(user.id),
          workspaceId
        }
      })

      if(existingMember) {
        throw new ConflictException('This user already exist in this workspace')
      }
    }
}

export function checkIfWorkspaceExists(workspace:Workspace){
      if(!workspace){
        console.log('workspace not found')
        throw new NotFoundException("Workspace not found")
      }
}
