import {Column, Entity, PrimaryGeneratedColumn} from "typeorm";

@Entity()
export class CalculationRate {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({ type: 'float' })
    residualValuePercentage: number;
    @Column({ type: 'float' })
    financingSpreadAnnual: number;
    @Column({ type: 'float' })
    fileFeesPercentage: number;
    @Column({ type: 'float' })
    leaserFinancingRateAnnual: number;
}
