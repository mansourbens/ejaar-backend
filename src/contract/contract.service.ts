import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Contract} from "./entities/contract.entity";
import {Repository} from "typeorm";
import {Quotation} from "../quotations/entities/quotation.entity";
import {QuotationStatusEnum} from "../quotations/enums/quotation-status.enum";
import { unlink } from 'fs/promises';

@Injectable()
export class ContractsService {
  constructor(
      @InjectRepository(Contract)
      private readonly contractRepository: Repository<Contract>,
      @InjectRepository(Quotation)
      private readonly quotationRepository: Repository<Quotation>,
  ) {}

  async createContract(file: Express.Multer.File, quotationId: string) {
    const quotation = await this.quotationRepository.findOneBy({ id: +quotationId });
    if (!quotation) {
      throw new Error('Quotation not found');
    }

    const contract = this.contractRepository.create({
      filename: file.filename,
      originalName: file.originalname,
      path: file.path,
      size: file.size,
      mimetype: file.mimetype,
      quotation,
    });

    // Update quotation status if needed
    quotation.status = QuotationStatusEnum.VALIDE; // Adjust based on your status enum

    await this.quotationRepository.save(quotation);
    return this.contractRepository.save(contract);
  }

  async getContractByQuotationId(quotationId: string) {
    return this.contractRepository.findOne({
      where: { quotation: { id: +quotationId } },
      select: ['id', 'filename', 'originalName', 'path', 'mimetype', 'size', 'uploadedAt'],
    });
  }

  async uploadContract(file: Express.Multer.File, quotationId: string, signed: boolean = false) {
    const quotation = await this.quotationRepository.findOneBy({ id: +quotationId });
    if (!quotation) {
      throw new Error('Quotation not found');
    }

    // Check if contract already exists
    let contract = await this.contractRepository.findOne({
      where: { quotation: { id: +quotationId } },
    });

    if (contract) {
      // Delete the old file
      try {
        await unlink(contract.path);
      } catch (error) {
        console.error('Error deleting old contract file:', error);
      }

      // Update existing contract
      contract.filename = file.filename;
      contract.originalName = file.originalname;
      contract.path = file.path;
      contract.size = file.size;
      contract.mimetype = file.mimetype;
      contract.uploadedAt = new Date();
      contract.signed = signed;
    } else {
      // Create new contract
      contract = this.contractRepository.create({
        filename: file.filename,
        originalName: file.originalname,
        path: file.path,
        size: file.size,
        mimetype: file.mimetype,
        quotation,
        signed,
      });
    }

    return this.contractRepository.save(contract);
  }
}
