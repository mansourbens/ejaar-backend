import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, JoinColumn} from 'typeorm';
import {Quotation} from "../../quotations/entities/quotation.entity";
import {User} from "../../users/entities/user.entity";
import {Role} from "../../users/entities/role.entity";
import {UserRole} from "../../users/enums/user-role.enum";
import {FileStatusEnum} from "../enums/file-status.enum";

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

    @Column({
        type: 'enum',
        enum: FileStatusEnum,
        default: FileStatusEnum.EN_VERIFICATION,
    })
    status: FileStatusEnum;
    
    @Column({nullable : true})
    rectificationReason: string;

    @Column({default : false})
    rectification: boolean;


    @ManyToOne(() => Quotation, (quotation) => quotation.documents)
    @JoinColumn()
    quotation: Quotation;
}
