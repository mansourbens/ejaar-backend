import {IsNotEmpty, IsOptional, IsPhoneNumber, IsString} from "class-validator";

export class CreateClientDto {
    @IsString()
    @IsNotEmpty()
    siren: string;

    @IsString()
    @IsNotEmpty()
    raisonSociale: string;

    @IsOptional()
    @IsPhoneNumber('MA') // or replace 'FR' with appropriate country code
    telephone?: string;

    @IsOptional()
    @IsString()
    address?: string;
}
