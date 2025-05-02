import {Injectable} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {User} from "./entities/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {MailService} from "../mail/mail.service";
import {JwtService} from "@nestjs/jwt";

@Injectable()
export class UsersService {
    // Create User

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
    ) {
    }


    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = new User();
        user.email = createUserDto.email;
        user.password = createUserDto.password;  // Set password from DTO
        user.role = createUserDto.role;
        if (createUserDto.createdAt) {
            user.createdAt = createUserDto.createdAt;
        }
        if (createUserDto.supplier) {
            user.supplier = createUserDto.supplier;
        }
        await user.hashPassword();
        return this.userRepository.save(user);
    }

    findAll() {
       return this.userRepository.find({relations: ['role', 'supplier']});
    }

    findById(id: number) {
        return this.userRepository.findOne({where: {id}})
    }

    update(id: number, updateUserDto: UpdateUserDto) {
        return `This action updates a #${id} user`;
    }

    remove(id: number) {
        return `This action removes a #${id} user`;
    }

    async findByEmail(email: string): Promise<User | null> {
        return this.userRepository.findOne({where: {email}, relations: ['supplier', 'role'] });
    }
    async save(user:User) {
        return this.userRepository.save(user);
    }

    findBySupplier(supplierId: number) {
        return this.userRepository.createQueryBuilder('user')
            .where('user.supplierId = :supplierId', { supplierId })
            .leftJoinAndSelect('user.supplier', 'supplier')
            .leftJoinAndSelect('user.role', 'role')
            .getMany();
    }

    async updateConnectionData(userId: number, date: Date) {
        await this.userRepository.update(userId, {
            lastConnectionAt: date,
        });
    }
}
