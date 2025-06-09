import {IsNotEmpty, IsOptional, IsPhoneNumber, IsString} from "class-validator";

export class CreateClientDto {
    @IsString()
    @IsNotEmpty()
    siren: string;

    @IsString()
    @IsNotEmpty()
    raisonSociale: string;

    @IsOptional()
    @IsPhoneNumber('MA')
    telephone?: string;

    @IsOptional()
    @IsString()
    address?: string;
}
