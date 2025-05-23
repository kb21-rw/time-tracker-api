import { Client } from '../clients/entities/client.entity'
import { UserWorkspace } from '../workspaces/entities/user-workspace.entity'
import { Workspace } from '../workspaces/entities/workspace.entity'

export interface InvitationDetails {
  email: string
  token: string
  workspaceId: string
  id: string
  created_at: Date
  updated_at: Date
}
