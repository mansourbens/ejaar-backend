import {Column, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {Supplier} from "../../suppliers/entities/supplier.entity";
import {Role} from "./role.entity";
import * as bcrypt from 'bcryptjs';
import {Quotation} from "../../quotations/entities/quotation.entity";
import {CategorieCA} from "../../rate-config/enums/categorie-ca";
import {Client} from "../../client/entities/client.entity";
import {Chat} from "../../chat/entities/chat.entity";

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

    @OneToOne(() => Client, (client) => client.user)
    @JoinColumn()
    client: Client;

    @OneToMany(() => Quotation, (quotation) => quotation.client)
    quotations: Quotation[];

    @OneToMany(() => Chat, (chat) => chat.sender)
    messages: Chat[];

    @Column({ default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ nullable: true })
    updatedAt: Date;

    @Column({ nullable: true })
    lastConnectionAt: Date;

    @Column({ nullable: true })
    caCategory: CategorieCA;

    @Column({default : true})
    isActive: boolean;

    // Method to hash the password before saving
    async hashPassword() {
        const salt = await bcrypt.genSalt(10); // Adjust the salt rounds if needed
        this.password = await bcrypt.hash(this.password, salt);
    }
}
