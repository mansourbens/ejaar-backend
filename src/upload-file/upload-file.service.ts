import {Injectable, NotFoundException} from '@nestjs/common';
import {UploadFileDto} from './dto/upload-file.dto';
import {UpdateUploadFileDto} from './dto/update-upload-file.dto';
import {UploadFile} from "./entities/upload-file.entity";
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {QuotationsService} from "../quotations/quotations.service";
import {FileStatusEnum} from "./enums/file-status.enum";

@Injectable()
export class UploadFileService {

  constructor(
      private quotationService: QuotationsService,
      @InjectRepository(UploadFile)
      private fileRepository: Repository<UploadFile>) {
  }

  async saveFileInfo(fileInfo: {
    filename: string;
    originalName: string;
    path: string;
    documentType: string;
    size: number;
    mimetype: string;
    quotationId: string;
    rectification: boolean;
  }) {
    const quotation = await this.quotationService.findOne(+fileInfo.quotationId);
    if (!quotation) return;
    if (fileInfo.rectification) {
      const oldDocs = await this.fileRepository.find( {where: {quotation: {id: +fileInfo.quotationId}, documentType: fileInfo.documentType}});
      if (oldDocs.length > 0) {
        await this.fileRepository.remove(oldDocs);
      }
    }
    const file = this.fileRepository.create({
      filename: fileInfo.filename,
      originalName: fileInfo.originalName,
      path: fileInfo.path,
      documentType: fileInfo.documentType,
      size: fileInfo.size,
      mimetype: fileInfo.mimetype,
      uploadedAt: new Date(),
      quotation: quotation,
      rectification: fileInfo.rectification
    });

    await this.fileRepository.save(file);

    return {
      id: file.id,
      originalName: file.originalName,
      documentType: file.documentType,
      size: file.size,
      url: `/uploads/${file.filename}`, // This assumes you'll serve files from /uploads
    };
  }

  async getDocumentsByQuotation(quotationId: string): Promise<UploadFileDto[]> {
    const documents = await this.fileRepository.find({
      where: { quotation: { id: +quotationId } },
      relations: ['quotation']
    });

    return documents.map(document => ({
      id: document.id,
      filename: document.filename,
      originalName: document.originalName,
      documentType: document.documentType,
      size: document.size,
      uploadedAt: document.uploadedAt,
      status: document.status,
      rejectionReason: document.rectificationReason,
      url: `/uploads/${document.filename}` // Adjust based on your file serving route
    }));
  }
  create(createUploadFileDto: UploadFileDto) {
    return 'This action adds a new uploadFile';
  }

  findAll() {
    return `This action returns all uploadFile`;
  }

  findOne(id: string) {
    return this.fileRepository.findOne({where: {id: id}});
  }

  update(id: number, updateUploadFileDto: UpdateUploadFileDto) {
    return `This action updates a #${id} uploadFile`;
  }

  remove(id: number) {
    return `This action removes a #${id} uploadFile`;
  }

  findFileById(id: string): Promise<UploadFile | null> {
    return this.fileRepository.findOne({ where: { id } });
  }

  async deleteFile(id: string): Promise<void> {
    await this.fileRepository.delete(id);
  }

    async validate(id: string) {
      const file = await this.fileRepository.findOne({where: {id}});
      if (!file) throw new NotFoundException();
      file.status = FileStatusEnum.VERIFE;
      return this.fileRepository.save(file);
    }
    async reject(id: string, rejectionReason: string) {
      const file = await this.fileRepository.findOne({where: {id}});
      if (!file) throw new NotFoundException();
      file.status = FileStatusEnum.A_RECTIFIER;
      file.rectificationReason = rejectionReason;
      return this.fileRepository.save(file);
    }
}
