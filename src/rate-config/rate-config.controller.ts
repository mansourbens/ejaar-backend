import {Body, Controller, Get, HttpCode, HttpStatus, Post} from '@nestjs/common';
import {RateConfigService} from "./rate-config.service";
import {BulkUpdateRateConfigDto} from "./dto/create-rate-config.dto";

@Controller('rate-config')
export class RateConfigController {
  constructor(private readonly rateConfigService: RateConfigService) {}

  @Get()
  async findAll() {
    return this.rateConfigService.findAll();
  }

  @Post('bulk-update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bulkUpdate(@Body() updateData: BulkUpdateRateConfigDto) {
    await this.rateConfigService.bulkUpdate(updateData);
  }

  @Post('seed')
  @HttpCode(HttpStatus.CREATED)
  async seed() {
    await this.rateConfigService.seedInitialData();
  }
}
