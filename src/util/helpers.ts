import { ConflictException, NotFoundException } from '@nestjs/common'
import { Client } from 'src/clients/entities/client.entity'
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
export function VerifyIfEntityExists(workspace?: Workspace, client?: Client) {
  if (!workspace) {
    throw new NotFoundException('Workspace not found')
  }
  if (client) {
    throw new ConflictException(
      `Client with the name ${client.name} already exists`,
    )
  }
}
