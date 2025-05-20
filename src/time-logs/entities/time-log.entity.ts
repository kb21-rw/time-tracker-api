import { IsNotEmpty, IsNumber } from "class-validator";
import { Project } from "src/projects/entities/project.entity";
import { User } from "src/users/entities/user.entity";
import { Workspace } from "src/workspaces/entities/workspace.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class TimeLog {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @ManyToOne(() => User, user => user.id, {
        onDelete: 'CASCADE' 
    })
    user: User;

    @ManyToOne(()=> Project, project => project.id, {
        onDelete: 'CASCADE'
    })
    project: Project;

    @ManyToOne(() => Workspace, workspace => workspace.id, {
        onDelete: 'CASCADE',
      })
    workspace: Workspace;

    @IsNotEmpty()
    @Column()
    startDate: Date;

    @Column({nullable: true})
    endDate: Date;

    @IsNotEmpty()
    @Column({ type: 'text', default: '' })
    description: string;

    @Column({ type: 'float', default: 0 })
    @IsNumber()
    duration: number;

    @Column({ default: false })
    manualDuration: boolean;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;
}
