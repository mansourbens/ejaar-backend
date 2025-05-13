import { Injectable } from '@nestjs/common';
import {BulkUpdateRateConfigDto, RateConfigDto} from './dto/create-rate-config.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {RateConfig} from "./entities/rate-config.entity";
import {Repository} from "typeorm";
import {CategorieCA} from "./enums/categorie-ca";

@Injectable()
export class RateConfigService {
  constructor(
      @InjectRepository(RateConfig)
      private readonly rateConfigRepo: Repository<RateConfig>,
  ) {}

  async findAll(): Promise<RateConfigDto[]> {
    return this.rateConfigRepo.find();
  }

  async bulkUpdate(updateData: BulkUpdateRateConfigDto): Promise<void> {
    const updatePromises = Object.entries(updateData)
        .filter(([categorieCA, value ]) => Object.values(CategorieCA).includes(categorieCA as CategorieCA))
        .map(([categorieCA, values]) => {
          return this.rateConfigRepo.update(categorieCA as CategorieCA, values);
        });

    await Promise.all(updatePromises);
  }

  async seedInitialData(): Promise<void> {
    const defaultData = [
      { categorieCA: CategorieCA.MOINS_DE_5M, tauxBanque: 9.0, spread: 4.0 },
      { categorieCA: CategorieCA.ENTRE_5M_ET_10M, tauxBanque: 8.5, spread: 4.0 },
      { categorieCA: CategorieCA.ENTRE_10M_ET_20M, tauxBanque: 8.0, spread: 4.0 },
      { categorieCA: CategorieCA.ENTRE_20M_ET_50M, tauxBanque: 7.0, spread: 3.0 },
      { categorieCA: CategorieCA.PLUS_DE_50M, tauxBanque: 6.0, spread: 3.0 },
    ];

    await this.rateConfigRepo.upsert(defaultData, ['categorieCA']);
  }
}
