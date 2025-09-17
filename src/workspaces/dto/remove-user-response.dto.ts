import { ApiProperty } from '@nestjs/swagger'

export class RemoveUserResponseDto {
  @ApiProperty({ example: 'User successfully removed from workspace' })
  message: string

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  workspaceId: string

  @ApiProperty({ example: 42 })
  removedUserId: number

  @ApiProperty({ example: 'john.doe@example.com' })
  removedUserEmail: string

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  removedAt: Date
}
