import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class CommercialMargin {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'float' })
    tauxMargeCommerciale: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' })
    updatedAt: Date;
}
