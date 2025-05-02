import {IsEmail, IsNotEmpty, IsOptional} from "class-validator";

export class CreateSupplierDto {
    @IsNotEmpty()
    siren: string;
    @IsEmail()
    @IsNotEmpty()
    email: string;
    @IsNotEmpty()
    raisonSociale: string;
    @IsNotEmpty()
    address: string;
    @IsOptional()
    createdAt?: Date;
    @IsOptional()
    updatedAt?: Date;
}
