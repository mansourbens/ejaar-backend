import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import {Supplier} from "../../suppliers/entities/supplier.entity";

@Entity()
export class Quotation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    amount: number;

    @Column()
    status: string;

    @ManyToOne(() => Supplier, (supplier) => supplier.quotations)
    @JoinColumn()
    supplier: Supplier;
}
