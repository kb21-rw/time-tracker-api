import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, MinLength} from "class-validator"

export class CreateUserDto {
    @ApiProperty({
        example: 'Christelle',
        required: true
    })
    fullName: string

    @ApiProperty({
        example: 'christelle@gmail.com',
        required: true
    })
    @IsEmail()
    email: string

    @ApiProperty({
        example: 'flow@123',
        required: true
    })
    @MinLength(8)
    password: string
}
