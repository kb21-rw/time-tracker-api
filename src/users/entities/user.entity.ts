import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "../dto/create-user.dto";
import { Exclude } from "class-transformer";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    name: string

    @Column()
    email: string

    @Column()
    @Exclude()
    password: string

    @Column()
    roles: UserRole
}
