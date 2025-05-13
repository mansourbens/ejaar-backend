import {Module} from '@nestjs/common';
import {RateConfigService} from './rate-config.service';
import {RateConfigController} from './rate-config.controller';
import {TypeOrmModule} from "@nestjs/typeorm";
import {RateConfig} from "./entities/rate-config.entity";

@Module({
  imports: [TypeOrmModule.forFeature([RateConfig]),],
  controllers: [RateConfigController],
  providers: [RateConfigService],
})
export class RateConfigModule {}
