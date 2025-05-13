import {CategorieCA} from "../enums/categorie-ca";
import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class RateConfig {
    @PrimaryColumn({ type: 'enum', enum: CategorieCA, enumName: 'categorie_ca_enum' })
    categorieCA: CategorieCA;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    tauxBanque: number;

    @Column({ type: 'decimal', precision: 5, scale: 2 })
    spread: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;
}
