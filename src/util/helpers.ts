import { ConflictException, NotFoundException } from '@nestjs/common'
import { UserWorkspace } from 'src/workspaces/entities/user-workspace.entity'
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
