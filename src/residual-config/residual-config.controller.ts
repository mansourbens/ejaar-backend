import {Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, Put} from '@nestjs/common';
import { ResidualConfigService } from './residual-config.service';
import {
  BulkUpdateResidualConfigDto,
  ResidualConfigDto, UpdateResidualConfigDto
} from './dto/create-residual-config.dto';
import {DeviceType} from "./enums/device-type";

@Controller('residual-config')
export class ResidualConfigController {
  constructor(private readonly residualConfigService: ResidualConfigService) {
  }

  @Get()
  async findAll() {
    return this.residualConfigService.findAll();
  }

  @Get(':device')
  async findOne(@Param('device') device: DeviceType) {
    return this.residualConfigService.findOne(device);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() config: ResidualConfigDto) {
    return this.residualConfigService.create(config);
  }

  @Patch(':device')
  async update(
      @Param('device') device: DeviceType,
      @Body() updateData: UpdateResidualConfigDto
  ) {
    return this.residualConfigService.update(device, updateData);
  }

  @Put('bulk-update')
  @HttpCode(HttpStatus.NO_CONTENT)
  async bulkUpdate(@Body() updateData: BulkUpdateResidualConfigDto) {
    await this.residualConfigService.bulkUpdate(updateData);
  }

  @Delete(':device')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('device') device: DeviceType) {
    await this.residualConfigService.delete(device);
  }

  @Post('seed')
  @HttpCode(HttpStatus.CREATED)
  async seed() {
    await this.residualConfigService.seedInitialData();
  }
}
