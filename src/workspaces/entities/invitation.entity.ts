import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class WorkspaceInvitation {

    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column()
    fullName: string

    @Column()
    email: string

    @Column()
    token: string

    @CreateDateColumn()
    created_at: Date
    
    @UpdateDateColumn()
    updated_at: Date

}