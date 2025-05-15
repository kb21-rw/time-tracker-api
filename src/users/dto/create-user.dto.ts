import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, MinLength} from "class-validator"

export class CreateUserDto {
    @ApiProperty({
        example: 'Christelle Gihozo',
        required: true
    })
    @IsNotEmpty()
    fullName: string

    @ApiProperty({
        example: 'christelle@gmail.com',
        required: true
    })
    @IsEmail()
    @IsNotEmpty()
    email: string

    @ApiProperty({
        example: 'flow@123',
        required: true
    })
    @MinLength(8)
    @IsNotEmpty()
    password: string
}
