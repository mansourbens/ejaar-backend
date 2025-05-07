import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "./user.entity";
import {UserRole} from "../enums/user-role.enum";

@Entity()
export class Role {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({
        unique: true,
        type: 'enum',
        enum: UserRole,
        default: UserRole.CLIENT,
    })
    name: UserRole;

    @OneToMany(() => User, (user) => user.role)
    users: User[];
}
