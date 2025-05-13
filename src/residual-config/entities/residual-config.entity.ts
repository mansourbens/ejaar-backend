import {Column, Entity, PrimaryColumn} from "typeorm";
import {DeviceType} from "../enums/device-type";

@Entity('residual_config')
export class ResidualConfig {
    @PrimaryColumn({
        type: 'enum',
        enum: DeviceType,
        enumName: 'device_type_enum'
    })
    device: DeviceType;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    months24: number;

    @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
    months36: number;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @Column({
        type: 'timestamp',
        default: () => 'CURRENT_TIMESTAMP',
        onUpdate: 'CURRENT_TIMESTAMP'
    })
    updatedAt: Date;
}
