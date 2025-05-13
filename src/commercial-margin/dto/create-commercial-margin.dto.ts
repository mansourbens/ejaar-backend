// create-commercial-margin.dto.ts
import { IsNumber, Min, Max } from 'class-validator';

export class CreateCommercialMarginDto {
    @IsNumber()
    @Min(0)
    @Max(100)
    tauxMargeCommerciale: number;
}
