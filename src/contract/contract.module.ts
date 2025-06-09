import { Module } from '@nestjs/common';
import { ContractsService } from './contract.service';
import { ContractsController } from './contract.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {Contract} from "./entities/contract.entity";
import {Quotation} from "../quotations/entities/quotation.entity";
import {QuotationsService} from "../quotations/quotations.service";

@Module({
  imports: [TypeOrmModule.forFeature([Contract, Quotation])],
  controllers: [ContractsController],
  providers: [ContractsService, QuotationsService],
  exports: [ContractsService],
})
export class ContractModule {}
