import {BadRequestException, Injectable} from '@nestjs/common';
import {CreateSupplierDto} from './dto/create-supplier.dto';
import {UpdateSupplierDto} from './dto/update-supplier.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "../users/entities/user.entity";
import {Repository} from "typeorm";
import {MailService} from "../mail/mail.service";
import {JwtService} from "@nestjs/jwt";
import {Supplier} from "./entities/supplier.entity";
import {CreateUserDto} from "../users/dto/create-user.dto";
import {Role} from "../users/entities/role.entity";
import {UserRole} from "../users/enums/user-role.enum";

@Injectable()
export class SuppliersService {

    constructor(@InjectRepository(Supplier) private readonly supplierRepository: Repository<Supplier>,
                @InjectRepository(User) private readonly userRepository: Repository<User>,
                @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
                private mailService: MailService,
                private jwtService: JwtService) {
    }

    create(createSupplierDto: CreateSupplierDto) {
        return 'This action adds a new supplier';
    }

    async createExternal(createSupplierDto: CreateSupplierDto): Promise<User> {
        const supplier = new Supplier();
        supplier.siren = createSupplierDto.siren;
        supplier.email = createSupplierDto.email;
        supplier.address = createSupplierDto.address;
        supplier.raisonSociale = createSupplierDto.raisonSociale;
        await this.supplierRepository.save(supplier);
        const supplierAdmin = new User();
        supplierAdmin.email = supplier.email;
        supplierAdmin.fullName = "admin";
        supplierAdmin.supplier = supplier;
        supplierAdmin.createdAt = new Date();
        supplierAdmin.password = Math.random().toString(36).slice(2).substring(0, 12);
        // random temporary password
        supplierAdmin.hashPassword();
        const token = this.jwtService.sign(
            {email: supplierAdmin.email},
            {expiresIn: '24h'},
        );
        await this.userRepository.save(supplierAdmin);
        await this.mailService.sendSetPasswordEmail(supplierAdmin, token);
        return this.supplierRepository.save(supplierAdmin);
    }

    findAll() {
        return `This action returns all suppliers`;
    }

    async findOne(id: number) {
        return await this.supplierRepository.findOne({where: {id}});
    }

    update(id: number, updateSupplierDto: UpdateSupplierDto) {
        return `This action updates a #${id} supplier`;
    }

    remove(id: number) {
        return `This action removes a #${id} supplier`;
    }

    async createClient(createUserDto: CreateUserDto) {
        const supplier = await this.supplierRepository.findOne({where: {id: createUserDto.supplier?.id}});
        if (!supplier) {
            throw new BadRequestException('Supplier not found');
        }
        const clientUser = new User();
        clientUser.email = createUserDto.email;
        if (createUserDto.fullName) {
            clientUser.fullName = createUserDto.fullName;
        }
        clientUser.supplier = supplier;
        clientUser.createdAt = new Date();
        clientUser.password = Math.random().toString(36).slice(2).substring(0, 12);

        const clientRole = await this.roleRepository.findOne({where: {name: UserRole.CLIENT}});
        if (clientRole) {
            clientUser.role = clientRole;
        }
        // random temporary password
        clientUser.hashPassword();
        const token = this.jwtService.sign(
            {email: clientUser.email},
            {expiresIn: '24h'},
        );
        const createdUser = await this.userRepository.save(clientUser);
        await this.mailService.sendSetPasswordEmail(clientUser, token);
        return createdUser;
    }
}
