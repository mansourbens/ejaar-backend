import { Injectable } from '@nestjs/common';
import { CreateCalculationRateDto } from './dto/create-calculation-rate.dto';
import { UpdateCalculationRateDto } from './dto/update-calculation-rate.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Supplier} from "../suppliers/entities/supplier.entity";
import {Repository} from "typeorm";
import {CalculationRate} from "./entities/calculation-rate.entity";
import {NotFoundError} from "rxjs";

@Injectable()
export class CalculationRatesService {

  constructor(@InjectRepository(CalculationRate) private readonly calculationRateRepository:
                  Repository<CalculationRate>) {
  }
  async create(createCalculationRateDto: CreateCalculationRateDto) {
    const calculationRate = this.calculationRateRepository.create(createCalculationRateDto);
    return await this.calculationRateRepository.save(calculationRate);
  }

  findAll() {
    return `This action returns all calculationRates`;
  }

  findOne(id: number) {
    return this.calculationRateRepository.findOne({where: {id}});
  }

  async update(id: number, updateCalculationRateDto: UpdateCalculationRateDto) {
    const calculationRate = await this.calculationRateRepository.findOne({where: {id}});
    if (!calculationRate) throw new NotFoundError('Calculation rate not found');
    const updated = this.calculationRateRepository.merge(calculationRate, updateCalculationRateDto);
    return await this.calculationRateRepository.save(updated);
  }

  remove(id: number) {
    return `This action removes a #${id} calculationRate`;
  }
}
