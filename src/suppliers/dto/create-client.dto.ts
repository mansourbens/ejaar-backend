import {User} from "../../users/entities/user.entity";

export interface CreateClientDto {
    id?: number;
    siren?: string;
    raisonSociale?: string;
    telephone?: string;
    address?: string;
    users?: User[];
    createdAt?: Date,
    updatedAt?: Date
    client: Client;
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
