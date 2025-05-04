import {
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common'
import { UserWorkspace } from 'src/workspaces/entities/user-workspace.entity'
import { Workspace } from 'src/workspaces/entities/workspace.entity'
import { Client } from 'src/clients/entities/client.entity'
import { Project } from 'src/projects/entities/project.entity'
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

export function validateWorkspace(workspace: Workspace | null) {
  if (workspace === null) {
    throw new NotFoundException('Workspace not found')
  }
}

export function checkIfClientExists(existingClient: Client | null) {
  if (existingClient) {
    throw new ConflictException(
      `Client with the name ${existingClient.name} already exists`,
    )
  }
}

export function checkIfProjectExists(existingProject: Project | null) {
  if (existingProject) {
    throw new ConflictException(
      `Project with the name ${existingProject.name} already exists`,
    )
  }
}

export function validateClient(client: Client | null) {
  if (client === null) {
    throw new NotFoundException('Client not found')
  }
}
