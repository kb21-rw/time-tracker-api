import { ApiProperty } from "@nestjs/swagger"
import { IsEmail, IsEnum, MinLength} from "class-validator"
import { UserRole } from "src/util/role.enum"

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

    @ApiProperty({
        example: 'Admin',
        required: true
    })
    @IsEnum(UserRole)
    roles: UserRole
}
