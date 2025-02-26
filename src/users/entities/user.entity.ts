import { Column, Entity, PrimaryColumn } from "typeorm";

@Entity()
export class User {
    @PrimaryColumn()
    id: number

    @Column()
    names: string

    @Column()
    email: string

    @Column()
    password: string
}
