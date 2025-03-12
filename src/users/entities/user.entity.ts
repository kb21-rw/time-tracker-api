import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
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
    roles: UserRole

    @CreateDateColumn()
    created_at: Date

    @UpdateDateColumn()
    updated_at: Date
}
