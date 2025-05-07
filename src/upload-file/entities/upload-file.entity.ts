import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn} from 'typeorm';
import {Quotation} from "../../quotations/entities/quotation.entity";
import {User} from "../../users/entities/user.entity";
import {Role} from "../../users/entities/role.entity";

@Entity()
export class UploadFile {
    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Column()
    filename: string;

    @Column()
    originalName: string;

    @Column()
    path: string;

    @Column()
    documentType: string;

    @Column('int')
    size: number;

    @Column()
    mimetype: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    uploadedAt: Date;


    @ManyToOne(() => Quotation, (quotation) => quotation.documents)
    @JoinColumn()
    quotation: Quotation;
}
