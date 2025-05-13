import { Injectable } from '@nestjs/common';
import {
  BulkUpdateResidualConfigDto,
  ResidualConfigDto, UpdateResidualConfigDto
} from './dto/create-residual-config.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {ResidualConfig} from "./entities/residual-config.entity";
import {Repository} from "typeorm";
import {DeviceType} from "./enums/device-type";


@Injectable()
export class ResidualConfigService {
  constructor(
      @InjectRepository(ResidualConfig)
      private readonly residualConfigRepo: Repository<ResidualConfig>,
  ) {}

  async findAll(): Promise<ResidualConfigDto[]> {
    return this.residualConfigRepo.find();
  }

  async findOne(device: DeviceType): Promise<ResidualConfigDto| null> {
    return this.residualConfigRepo.findOne({ where: { device } });
  }

  async create(config: ResidualConfigDto): Promise<ResidualConfigDto> {
    return this.residualConfigRepo.save(config);
  }

  async update(
      device: DeviceType,
      updateData: UpdateResidualConfigDto
  ): Promise<ResidualConfigDto | null> {
    await this.residualConfigRepo.update(device, updateData);
    return this.findOne(device);
  }

  async bulkUpdate(updateData: BulkUpdateResidualConfigDto): Promise<void> {
    // Get all valid device types as strings
    const validDevices = new Set(Object.values(DeviceType).map(d => d.toString()));

    const updatePromises = Object.entries(updateData)
        // Type-safe filtering - we know the key is a string from Object.entries
        .filter(([device,value]) => validDevices.has(device))
        .map(([device, values]) => {
          // Safe to cast now that we've filtered
          return this.residualConfigRepo.update(device as DeviceType, values);
        });

    await Promise.all(updatePromises);
  }

  async delete(device: DeviceType): Promise<void> {
    await this.residualConfigRepo.delete(device);
  }

  async seedInitialData(): Promise<void> {
    const defaultData = Object.values(DeviceType).map((device) => {
      let months24 = 10;
      let months36 = 5;

      if ([DeviceType.PRINTER, DeviceType.SCANNER, DeviceType.NETWORK_EQUIPMENT, DeviceType.OTHER].includes(device as DeviceType.PRINTER | DeviceType.SCANNER | DeviceType.NETWORK_EQUIPMENT | DeviceType.OTHER )) {
        months24 = 5;
        months36 = 1;
      }

      return { device, months24, months36 };
    });

    await this.residualConfigRepo.upsert(defaultData, ['device']);
  }
}
