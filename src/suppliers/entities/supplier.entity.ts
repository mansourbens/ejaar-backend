import {Column, Entity, OneToMany, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entities/user.entity";
import {Quotation} from "../../quotations/entities/quotation.entity";

@Entity()
export class Supplier {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({nullable : true})
    siren: string;

    @Column({nullable : true})
    raisonSociale: string;

    @Column()
    email: string;

    @Column({nullable : true})
    address: string;

    @OneToMany(() => User, (user) => user.supplier)
    users: User[];

    @OneToMany(() => Quotation, (quotation) => quotation.supplier)
    quotations: Quotation[];
}
