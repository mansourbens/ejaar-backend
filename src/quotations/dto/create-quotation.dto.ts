import {IsArray, IsString} from "class-validator";

export class CreateQuotationDto {
    @IsArray()
    devices: {
        type: string;
        unitCost: number;
        units: number;
    }[];

    @IsString()
    duration: string;
}
