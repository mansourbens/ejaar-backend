import {Column, Entity, OneToMany, OneToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entities/user.entity";

@Entity()
export class Client {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({unique: true})
    ICE: string;
    @Column({unique: true})
    raisonSociale: string;

    @Column({nullable: true})
    telephone: string;
    @Column()
    address?: string;

    @OneToOne(() => User, (user) => user.client)
    user?: User;
    @Column({default: () => 'CURRENT_TIMESTAMP'})
    createdAt?: Date;

    @Column({nullable: true})
    updatedAt?: Date
}
