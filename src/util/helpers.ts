import { ConflictException, NotFoundException } from '@nestjs/common'
import { Grouping1 } from 'src/groupings/entities/grouping1.entity'
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
export function VerifyIfEntityExists(
  workspace?: Workspace,
  grouping1?: Grouping1,
) {
  if (!workspace) {
    throw new NotFoundException('Workspace not found')
  }
  if (grouping1) {
    throw new ConflictException(
      `Grouping 1 with the name ${grouping1.name} already exists`,
    )
  }
}
