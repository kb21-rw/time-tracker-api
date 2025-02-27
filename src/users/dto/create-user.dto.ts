import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, MinLength, minLength } from "class-validator"


export enum UserRole {
    Admin = 'Admin',
    Member = 'Member'
}

export class CreateUserDto {
    id: number

    @ApiProperty({
        example: 'Christelle',
        required: true
    })
    name: string

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
