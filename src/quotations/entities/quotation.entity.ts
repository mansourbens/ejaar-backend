import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import {Supplier} from "../../suppliers/entities/supplier.entity";
import {User} from "../../users/entities/user.entity";
import {QuotationStatusEnum} from "../enums/quotation-status.enum";

@Entity()
export class Quotation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    amount: number;

    @Column()
    duration: number;

    @Column()
    status: QuotationStatusEnum;

    @ManyToOne(() => User, (user) => user.quotations)
    @JoinColumn()
    client: User;

    @ManyToOne(() => Supplier, (supplier) => supplier.quotations)
    @JoinColumn()
    supplier: Supplier;

    @Column()
    fileName: string;

    @Column()
    createdAt: Date;

}
