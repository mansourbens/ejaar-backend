import {Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {User} from "../../users/entities/user.entity";
@Entity()
export class Chat {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    message: string;

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    createdAt: Date;

    @ManyToOne(() => User, (user) => user.messages)
    @JoinColumn()
    sender: User;

    @Column({default: false})
    isSeen: boolean;

    @Column()
    type: 'admin' | 'user';
}
