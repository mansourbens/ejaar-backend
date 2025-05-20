import {Module} from '@nestjs/common';
import {CommercialMarginService} from './commercial-margin.service';
import {CommercialMarginController} from './commercial-margin.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {CommercialMargin} from "./entities/commercial-margin.entity";

@Module({
  imports: [TypeOrmModule.forFeature([CommercialMargin])],
  controllers: [CommercialMarginController],
  providers: [CommercialMarginService],
})
export class CommercialMarginModule {}
