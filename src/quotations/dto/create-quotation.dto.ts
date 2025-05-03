import {IsArray, IsNumber, IsString} from "class-validator";

export class CreateQuotationDto {
    @IsArray()
    devices: {
        type: string;
        unitCost: number;
        units: number;
    }[];

    @IsNumber()
    duration: number;

    @IsNumber()
    clientId: number;

    @IsNumber()
    supplierId: number;
}
