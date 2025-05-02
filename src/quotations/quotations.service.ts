import { Injectable } from '@nestjs/common';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Quotation} from "./entities/quotation.entity";
import {Repository} from "typeorm";

@Injectable()
export class QuotationsService {
  constructor(
      @InjectRepository(Quotation) private readonly quotationRepository: Repository<Quotation>) {
  }
  create(createQuotationDto: CreateQuotationDto) {
    return 'This action adds a new quotation';
  }

  findAll() {
    return this.quotationRepository.find();
  }

  findOne(id: number) {
    return `This action returns a #${id} quotation`;
  }

  update(id: number, updateQuotationDto: UpdateQuotationDto) {
    return `This action updates a #${id} quotation`;
  }

  remove(id: number) {
    return `This action removes a #${id} quotation`;
  }
}
