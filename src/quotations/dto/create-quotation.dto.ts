import {IsArray, IsNumber, IsOptional, IsString} from "class-validator";
import {CategorieCA} from "../../rate-config/enums/categorie-ca";

export class CreateQuotationDto {
    @IsArray()
    devices: {
        type: string;
        unitCost: number;
        units: number;
        duration: string;
    }[];

    @IsNumber()
    duration: number;

    @IsNumber()
    clientId: number;

    @IsNumber()
    supplierId: number;

    @IsOptional()
    clientCA: CategorieCA;
}
