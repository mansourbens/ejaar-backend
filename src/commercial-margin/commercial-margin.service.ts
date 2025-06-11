import {Injectable, NotFoundException} from '@nestjs/common';
import { CreateCommercialMarginDto } from './dto/create-commercial-margin.dto';
import { UpdateCommercialMarginDto } from './dto/update-commercial-margin.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Quotation} from "../quotations/entities/quotation.entity";
import {Repository} from "typeorm";
import {CommercialMargin} from "./entities/commercial-margin.entity";

@Injectable()
export class CommercialMarginService {
  constructor(@InjectRepository(CommercialMargin) private readonly commercialMarginRepository: Repository<CommercialMargin>) {

  }

  create(createCommercialMarginDto: CreateCommercialMarginDto) {
    return 'This action adds a new commercialMargin';
  }

  findAll() {
    return `This action returns all commercialMargin`;
  }

  async findOne(id: number) {
    const commercialMargin = await this.commercialMarginRepository.findOneBy({id})
    if (!commercialMargin) throw new NotFoundException();
    return commercialMargin;
  }

  async update(id: number, updateCommercialMarginDto: UpdateCommercialMarginDto) {
    const commercialMargin = await this.commercialMarginRepository.findOneBy({id})
    if (!commercialMargin) throw new NotFoundException();
    if (!updateCommercialMarginDto.tauxMargeCommerciale) return;
    commercialMargin.tauxMargeCommerciale = updateCommercialMarginDto.tauxMargeCommerciale;
    return this.commercialMarginRepository.save(commercialMargin);
  }

  remove(id: number) {
    return `This action removes a #${id} commercialMargin`;
  }

  async seedInitialData() {
    await this.commercialMarginRepository.clear();
    await this.commercialMarginRepository.query(`ALTER SEQUENCE commercial_margin_id_seq RESTART WITH 1`);
    const commercialMargin = new CommercialMargin();
    commercialMargin.id = 1;
    commercialMargin.tauxMargeCommerciale = 4/100;
    await this.commercialMarginRepository.save(commercialMargin);
  }
}
