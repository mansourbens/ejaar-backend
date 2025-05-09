import { Module } from '@nestjs/common';
import { CalculationRatesService } from './calculation-rates.service';
import { CalculationRatesController } from './calculation-rates.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {User} from "../users/entities/user.entity";
import {Role} from "../users/entities/role.entity";
import {CalculationRate} from "./entities/calculation-rate.entity";

@Module({
  imports: [TypeOrmModule.forFeature([CalculationRate]),],
    controllers: [CalculationRatesController],
  providers: [CalculationRatesService],
})
export class CalculationRatesModule {}
