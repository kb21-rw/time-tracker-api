import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { Client } from 'src/clients/entities/client.entity'
import { UserWorkspace } from 'src/workspaces/entities/user-workspace.entity'
import { Workspace } from 'src/workspaces/entities/workspace.entity'
import { Entities } from './types'
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
export function VerifyIfEntityExists({
  workspace,
  existingClient,
  userWorkspace,
}: Entities) {
  if (workspace === null) {
    throw new NotFoundException('Workspace not found')
  }

  if (existingClient) {
    throw new ConflictException(
      `Client with the name ${existingClient.name} already exists`,
    )
  }

  if (userWorkspace === null) {
    throw new ForbiddenException('You do not belong to this workspace')
  }
}
