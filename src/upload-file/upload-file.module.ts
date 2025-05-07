import {Module, UploadedFile} from '@nestjs/common';
import { UploadFileService } from './upload-file.service';
import { UploadFileController } from './upload-file.controller';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';
import {TypeOrmModule} from "@nestjs/typeorm";
import {UploadFile} from "./entities/upload-file.entity";
import {QuotationsService} from "../quotations/quotations.service";
import {Quotation} from "../quotations/entities/quotation.entity";
@Module({
  imports: [TypeOrmModule.forFeature([UploadFile, Quotation])],
  controllers: [UploadFileController],
  providers: [UploadFileService, QuotationsService],
})
export class UploadFileModule {}
