import {IsEmail, IsNotEmpty, IsOptional, IsString} from "class-validator";
import {Role} from "../entities/role.entity";
import {Supplier} from "../../suppliers/entities/supplier.entity";
import {User} from "../entities/user.entity";
import {CreateClientDto} from "../../client/dto/create-client.dto";
import {CategorieCA} from "../../rate-config/enums/categorie-ca";

export class CreateUserDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsOptional()
    raisonSociale?: string;

    @IsOptional()
    ICE?: string;

    @IsOptional()
    address?: string;

    @IsString()
    @IsOptional()
    password: string;

    @IsOptional()
    role: Role;

    @IsOptional()
    supplier?: Supplier;

    @IsOptional()
    fullName?: string;


    @IsOptional()
    client?: CreateClientDto;

    @IsOptional()
    createdAt?: Date;

    @IsOptional()
    updatedAt?: Date;

    @IsOptional()
    userType?: UserType;

    @IsOptional()
    caCategory?: CategorieCA;


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
export enum UserType {
    CLIENT = 'CLIENT',
    FOURNISSEUR = 'FOURNISSEUR',
}
