import { IsNotEmpty, IsString } from 'class-validator'

export class CreateGrouping1Dto {
  @IsNotEmpty()
  @IsString()
  name: string
}
