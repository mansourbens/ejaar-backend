import {IsEmail, IsNotEmpty, IsOptional, IsString} from "class-validator";
import {Role} from "../entities/role.entity";
import {Supplier} from "../../suppliers/entities/supplier.entity";
import {User} from "../entities/user.entity";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsString()
    @IsNotEmpty()
    password: string;

    // Optionally, you can validate the role and supplier.
    // If the role and supplier are required fields for creating a user,
    // you can leave them as non-optional.
    @IsNotEmpty()
    role: Role;

    @IsOptional()
    supplier?: Supplier;

    @IsOptional()
    fullName?: string;


    @IsOptional()
    client?: Client;

    @IsOptional()
    createdAt?: Date;

    @IsOptional()
    updatedAt?: Date;
}
interface Client {
    id?: number;
    siren?: string;
    raisonSociale?: string;
    telephone?: string;
    address?: string;
    users?: User[];
    createdAt?: Date,
    updatedAt?: Date
}
