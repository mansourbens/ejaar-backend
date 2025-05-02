import { Module } from '@nestjs/common';
import { QuotationsService } from './quotations.service';
import { QuotationsController } from './quotations.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Supplier} from "../suppliers/entities/supplier.entity";
import {User} from "../users/entities/user.entity";
import {Quotation} from "./entities/quotation.entity";

@Module({
  imports: [TypeOrmModule.forFeature([Quotation])],
    controllers: [QuotationsController],
  providers: [QuotationsService],
})
export class QuotationsModule {}
