import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import {Supplier} from "../../suppliers/entities/supplier.entity";
import {User} from "../../users/entities/user.entity";
import {QuotationStatusEnum} from "../enums/quotation-status.enum";
import {UploadFile} from "../../upload-file/entities/upload-file.entity";

@Entity()
export class Quotation {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    amount: number;

    @Column({nullable: true, type: 'float'})
    totalMonthlyPayments: number;

    @Column({nullable: true})
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


    @OneToMany(() => UploadFile, (uploadFile) => uploadFile.quotation)
    documents: UploadFile[];

    @Column({ unique: true })
    number: string;

    @Column({ nullable: true })
    rejectReason: string;

    @Column({ nullable: true })
    devices: string;
}
