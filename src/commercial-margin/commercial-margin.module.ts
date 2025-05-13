import { Module } from '@nestjs/common';
import { CommercialMarginService } from './commercial-margin.service';
import { CommercialMarginController } from './commercial-margin.controller';

@Module({
  controllers: [CommercialMarginController],
  providers: [CommercialMarginService],
})
export class CommercialMarginModule {}
