import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";
import { UserRole } from "src/util/role.enum";
import { Exclude } from "class-transformer";

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    fullName: string

    @Column({unique: true})
    email: string

    @Column()
    @Exclude()
    password: string

    @Column()
    role: UserRole
}
