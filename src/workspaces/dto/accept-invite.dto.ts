import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AcceptInviteDto {
    @IsNotEmpty()
    @IsString()
    token: string;

    @ApiProperty({
        example: 'flow@123',
        required: true,
      })
    @IsString()
    @IsNotEmpty()
    password: string
}