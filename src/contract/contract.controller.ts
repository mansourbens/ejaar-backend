// src/contracts/contracts.controller.ts
import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  Get,
  Param,
  Res,
  NotFoundException
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import {ContractsService} from "./contract.service";
import {QuotationsService} from "../quotations/quotations.service";
import { stat } from 'fs/promises';
import { createReadStream } from 'fs';
import {Response} from 'express';

@Controller('contracts')
export class ContractsController {
  constructor(private readonly contractsService: ContractsService,
              private readonly quotationService: QuotationsService
              ) {}

  @Post('submit')
  @UseInterceptors(FileInterceptor('contract', {
    storage: diskStorage({
      destination: '/var/opt/ejaar/contracts',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  }))
  async submitContract(
      @UploadedFile() file: Express.Multer.File,
      @Body() body: { quotationId: string },
  ) {
    console.log('error');
    if (!file) {
      throw new Error('No file uploaded');
    }

    const result = await this.contractsService.createContract(file, body.quotationId);

    await this.quotationService.validateFolder(+body.quotationId);

    return {
      success: true,
      message: 'Contract submitted successfully',
      data: {
        id: result.id,
        filename: result.filename,
        originalName: result.originalName,
        uploadedAt: result.uploadedAt,
      },
    };
  }
  @Get('download/:quotationId')
  async downloadContract(
      @Param('quotationId') quotationId: string,
      @Res() res: Response,
  ) {
    const contract = await this.contractsService.getContractByQuotationId(quotationId);

    if (!contract) {
      throw new NotFoundException('Contract not found for this quotation');
    }

    try {
      // Check if file exists
      await stat(contract.path);

      // Set proper headers for file download
      res.setHeader('Content-Type', contract.mimetype);
      res.setHeader(
          'Content-Disposition',
          `attachment; filename="${contract.originalName}"`,
      );

      // Create file stream and pipe to response
      const fileStream = createReadStream(contract.path);
      fileStream.pipe(res);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new NotFoundException('Contract file not found on server');
      }
      throw error;
    }
  }

  @Post('upload-signed/:quotationId')
  @UseInterceptors(FileInterceptor('contract', {
    storage: diskStorage({
      destination: '/var/opt/ejaar/contracts',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `signed-${uniqueSuffix}${ext}`);
      },
    }),
    fileFilter: (req, file, cb) => {
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
      if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false);
      }
    },
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit
    },
  }))
  async uploadSignedContract(
      @UploadedFile() file: Express.Multer.File,
      @Param('quotationId') quotationId: string,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }

    const result = await this.contractsService.uploadContract(file, quotationId, true);

    return {
      success: true,
      message: 'Signed contract uploaded successfully',
      data: {
        id: result.id,
        filename: result.filename,
        originalName: result.originalName,
        signed: result.signed,
        uploadedAt: result.uploadedAt,
      },
    };
  }
}
