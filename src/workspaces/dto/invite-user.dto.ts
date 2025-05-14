import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, IsString } from "class-validator"

export class InviteUserDto {
    @ApiProperty({
        example: 'johndoe@gmail.com',
        required: true
    })
    @IsEmail()
    @IsNotEmpty()
    email: string
}