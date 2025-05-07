import {Injectable} from "@nestjs/common";
import {InjectRepository} from "@nestjs/typeorm";
import {User} from "./entities/user.entity";
import {Repository} from "typeorm";
import {Role} from "./entities/role.entity";
import {UserRole} from "./enums/user-role.enum";

@Injectable()
export class RolesService {
    constructor(@InjectRepository(Role) private readonly roleRepository: Repository<Role>) {
    }

    async findByName(name: UserRole) : Promise<Role | null> {
        return await this.roleRepository.findOne({ where: { name } });
    }
    async save(role: Role) : Promise<Role | null> {
        return await this.roleRepository.save(role);
    }

}
