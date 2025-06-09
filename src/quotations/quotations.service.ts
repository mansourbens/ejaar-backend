import {Injectable, NotFoundException} from '@nestjs/common';
import {CreateQuotationDto} from './dto/create-quotation.dto';
import {UpdateQuotationDto} from './dto/update-quotation.dto';
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
    return this.quotationRepository.find({relations: ['supplier', 'client', 'contract'],  order: { createdAt: 'DESC' }});
  }
  countToVerifyEjaar() {
    return this.quotationRepository.count({where : {status : QuotationStatusEnum.VERIFICATION}});
  }
  findAllByClient(clientId: string) {
    return this.quotationRepository.find({where : {client : {id : +clientId}}, order: { createdAt: 'DESC' }, relations: ['contract']});
  }

  findOne(id: number) {
    return this.quotationRepository.findOne({where: {id}, relations: ['contract']});
  }

  update(id: number, updateQuotationDto: UpdateQuotationDto) {
    return `This action updates a #${id} quotation`;
  }

  async remove(id: number) {
    const quotation = await this.quotationRepository.findOne({where: {id}});
    if (!quotation) throw new NotFoundException("Devis n'existe pas");
    return this.quotationRepository.remove(quotation);
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
  generateUniqueNumber(): string {
    const prefix = 'DEV';
    const randomHex = Math.floor(Math.random() * 0xffff)
        .toString(16)
        .padStart(4, '0')
        .toUpperCase();
    const datePart = new Date().toISOString().split('T')[0].replace(/-/g, '');

    return `${prefix}-${randomHex}-${datePart}`;
  }

  async reject(id: number, rejectReason: string) {
    const quotation = await this.quotationRepository.findOne({ where: { id } });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }
    quotation.status = QuotationStatusEnum.REJECTED;
    quotation.rejectReason = rejectReason;
    await this.quotationRepository.save(quotation);
  }

  async sendToVerification(id: number) {
    const quotation = await this.quotationRepository.findOne({ where: { id } });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }
    quotation.status = QuotationStatusEnum.VERIFICATION;
    await this.quotationRepository.save(quotation);
  }
  async sendToBank(id: number) {
    const quotation = await this.quotationRepository.findOne({ where: { id } });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }
    quotation.status = QuotationStatusEnum.SENT_TO_BANK;
    await this.quotationRepository.save(quotation);
  }
  async validateFolder(id: number) {
    const quotation = await this.quotationRepository.findOne({ where: { id } });

    if (!quotation) {
      throw new NotFoundException(`Quotation with ID ${id} not found`);
    }
    quotation.status = QuotationStatusEnum.VALIDE;
    await this.quotationRepository.save(quotation);
  }
}
