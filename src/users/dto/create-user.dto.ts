import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsNotEmpty, MinLength} from "class-validator"

export class CreateUserDto {
    @ApiProperty({
        example: 'Christelle Gihozo',
        required: true
    })
    @IsNotEmpty({message: 'Fullname is required'})
    fullName: string

    @ApiProperty({
        example: 'christelle@gmail.com',
        required: true
    })
    @IsEmail()
    @IsNotEmpty({message: 'Email is required'})
    email: string

    @ApiProperty({
        example: 'flow@123',
        required: true
    })
    @MinLength(8)
    @IsNotEmpty({message: 'Password is required'})
    password: string
}
