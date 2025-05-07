import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateUserDto} from './dto/create-user.dto';
import {UpdateUserDto} from './dto/update-user.dto';
import {User} from "./entities/user.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Role} from "./entities/role.entity";
import {UserRole} from "./enums/user-role.enum";
import {JwtService} from "@nestjs/jwt";
import {MailService} from "../mail/mail.service";

@Injectable()
export class UsersService {
    // Create User

    constructor(@InjectRepository(User) private readonly userRepository: Repository<User>,
                @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
                private jwtService: JwtService,
                private mailService: MailService
    ) {
    }


    async createBankUser(createUserDto: CreateUserDto): Promise<void> {
        const user = new User();
        user.email = createUserDto.email;
        user.password = Math.random().toString(36).slice(2).substring(0, 12);  // Set password from DTO
        const bankRole = await this.roleRepository.findOne({where : {name : UserRole.BANK}});
        if (!bankRole)             throw new NotFoundException('Role BANK not found');
        user.role = bankRole;
        if (createUserDto.fullName) {
            user.fullName = createUserDto.fullName;
        }
        user.createdAt = new Date();
        if (createUserDto.supplier) {
            user.supplier = createUserDto.supplier;
        }
        await user.hashPassword();
        const token = this.jwtService.sign(
            {email: user.email},
            {expiresIn: '24h'},
        );
        await this.userRepository.save(user);
        await this.mailService.sendSetPasswordEmail(user, token);
    }
    async create(createUserDto: CreateUserDto): Promise<User> {
        const user = new User();
        user.email = createUserDto.email;
        user.password = createUserDto.password;  // Set password from DTO
        user.role = createUserDto.role;
        if (createUserDto.fullName) {
            user.fullName = createUserDto.fullName;
        }
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
        return this.userRepository.findOne({relations: ['role'], where: {id}})
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
