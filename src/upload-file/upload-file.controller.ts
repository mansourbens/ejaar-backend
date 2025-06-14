import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  Headers,
  UseInterceptors,
  UploadedFile, NotFoundException, InternalServerErrorException, Res
} from '@nestjs/common';
import {UploadFileService} from './upload-file.service';
import {UploadFileDto} from './dto/upload-file.dto';
import {UpdateUploadFileDto} from './dto/update-upload-file.dto';
import {Request, Response} from 'express';
import Busboy from 'busboy';
import * as fs from 'fs';
import * as path from 'path';
import {FileInterceptor} from "@nestjs/platform-express";
import {diskStorage} from "multer";
import {stat} from "fs/promises";
import {createReadStream} from "fs";
@Controller('upload')
export class UploadFileController {
  constructor(private readonly uploadFileService: UploadFileService) {}


  @Post()
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: '/var/opt/ejaar/uploads',
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, `${uniqueSuffix}${ext}`);
      },
    }),
  }))
  async uploadFile(
      @UploadedFile() file: Express.Multer.File,
      @Body() body: { documentType: string; originalName: string, quotationId: string, rectification: string }
  ) {
    const result = await this.uploadFileService.saveFileInfo({
      filename: file.filename,
      originalName: body.originalName || file.originalname,
      path: file.path,
      documentType: body.documentType,
      size: file.size,
      mimetype: file.mimetype,
      quotationId: body.quotationId,
      rectification: !!body.rectification
    });
    return result;
  }

  @Get('quotation/:quotationId')
  async getDocumentsByQuotation(
      @Param('quotationId') quotationId: string
  ): Promise<UploadFileDto[]> {
    return this.uploadFileService.getDocumentsByQuotation(quotationId);
  }
  @Get()
  findAll() {
    return this.uploadFileService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.uploadFileService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUploadFileDto: UpdateUploadFileDto) {
    return this.uploadFileService.update(+id, updateUploadFileDto);
  }

  @Get('validate/:id')
  async validate(@Param('id') id: string){
    return this.uploadFileService.validate(id);
  }
  @Post('reject/:id')
  async reject(@Param('id') id: string, @Body() body: { rejectionReason }){
    return this.uploadFileService.reject(id, body.rejectionReason);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    // 1. Fetch file from DB
    const file = await this.uploadFileService.findFileById(id);
    if (!file) {
      throw new NotFoundException('File not found');
    }

    // 2. Delete file from disk
    const filePath = file.path;
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch (err) {
      console.error('Error deleting file from disk:', err);
      throw new InternalServerErrorException('Failed to delete file from disk');
    }

    // 3. Delete file from database
    try {
      await this.uploadFileService.deleteFile(id);
    } catch (err) {
      console.error('Error deleting file from database:', err);
      throw new InternalServerErrorException('Failed to delete file from database');
    }

    return {message: 'File deleted successfully'};
  }

  @Get('download/:documentId')
  async downloadContract(
      @Param('documentId') documentId: string,
      @Res() res: Response,
  ) {
    const document = await this.uploadFileService.findOne(documentId);

    if (!document) {
      throw new NotFoundException('Contract not found for this quotation');
    }

    try {
      // Check if file exists
      await stat(document.path);

      // Set proper headers for file download
      res.setHeader("Access-Control-Expose-Headers", "Content-Disposition, Content-Type");
      res.setHeader('Content-Type', document.mimetype);
      res.setHeader(
          'Content-Disposition',
          `attachment; filename="${document.originalName}"`,
      );

      // Create file stream and pipe to response
      const fileStream = createReadStream(document.path);
      fileStream.pipe(res);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new NotFoundException('Contract file not found on server');
      }
      throw error;
    }
  }
}
