import {CategorieCA} from "../enums/categorie-ca";

export class RateConfigDto {
    categorieCA: CategorieCA;
    tauxBanque: number;
    spread: number;
}

export class UpdateRateConfigDto {
    tauxBanque?: number;
    spread?: number;
}

export class BulkUpdateRateConfigDto {
    [categorieCA: string]: {
        tauxBanque: number;
        spread: number;
    };
}
