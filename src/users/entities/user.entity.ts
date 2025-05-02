import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {Supplier} from "../../suppliers/entities/supplier.entity";
import {Role} from "./role.entity";
import * as bcrypt from 'bcryptjs';

@Entity()
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ nullable: true, name : "full_name"})
    fullName: string;

    @ManyToOne(() => Role, (role) => role.users)
    @JoinColumn()
    role: Role;

    @ManyToOne(() => Supplier, (supplier) => supplier.users)
    @JoinColumn()
    supplier: Supplier;

    @Column()
    createdAt: Date;

    @Column({ nullable: true })
    updatedAt: Date;

    @Column({ nullable: true })
    lastConnectionAt: Date;

    // Method to hash the password before saving
    async hashPassword() {
        const salt = await bcrypt.genSalt(10); // Adjust the salt rounds if needed
        this.password = await bcrypt.hash(this.password, salt);
    }
}
