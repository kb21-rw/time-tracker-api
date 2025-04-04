import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class AcceptInviteDto {
    @IsNotEmpty()
    @ApiProperty({
      example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
    })
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