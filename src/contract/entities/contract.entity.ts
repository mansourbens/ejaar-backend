// src/contracts/entities/contract.entity.ts
import { Quotation } from '../../quotations/entities/quotation.entity';
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity()
export class Contract {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    filename: string;

    @Column()
    originalName: string;

    @Column()
    path: string;

    @Column()
    size: number;

    @Column()
    mimetype: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    uploadedAt: Date;

    @OneToOne(() => Quotation, (quotation) => quotation.contract)
    @JoinColumn()
    quotation: Quotation;

    @Column({default: false})
    signed: boolean;
}
