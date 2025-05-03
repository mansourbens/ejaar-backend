import {Injectable, NotFoundException} from '@nestjs/common';
import { CreateQuotationDto } from './dto/create-quotation.dto';
import { UpdateQuotationDto } from './dto/update-quotation.dto';
import {InjectRepository} from "@nestjs/typeorm";
import {Quotation} from "./entities/quotation.entity";
import {Repository} from "typeorm";
import {QuotationStatusEnum} from "./enums/quotation-status.enum";

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
    return this.quotationRepository.findOne({where: {id}});
  }

  update(id: number, updateQuotationDto: UpdateQuotationDto) {
    return `This action updates a #${id} quotation`;
  }

  remove(id: number) {
    return `This action removes a #${id} quotation`;
  }
  async save(quotation: Quotation) {
    return this.quotationRepository.save(quotation);
  }

  async updateStatus(id: number, status: QuotationStatusEnum): Promise<Quotation> {
    const quotation = await this.quotationRepository.findOne({ where: { id } });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }

    quotation.status = status;
    return await this.quotationRepository.save(quotation);
  }
}
