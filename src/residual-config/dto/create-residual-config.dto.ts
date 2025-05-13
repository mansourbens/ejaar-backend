import {DeviceType} from "../enums/device-type";

export class ResidualConfigDto {
    device: DeviceType;
    months24: number;
    months36: number;
}

export class UpdateResidualConfigDto {
    months24?: number;
    months36?: number;
}

export type BulkUpdateResidualConfigDto = {
    [key in DeviceType]?: {
        months24: number;
        months36: number;
    };
};
