import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CalculationRatesService } from './calculation-rates.service';
import { CreateCalculationRateDto } from './dto/create-calculation-rate.dto';
import { UpdateCalculationRateDto } from './dto/update-calculation-rate.dto';

@Controller('calculation-rates')
export class CalculationRatesController {
  constructor(private readonly calculationRatesService: CalculationRatesService) {}

  @Post()
  create(@Body() createCalculationRateDto: CreateCalculationRateDto) {
    return this.calculationRatesService.create(createCalculationRateDto);
  }

  @Get()
  findAll() {
    return this.calculationRatesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.calculationRatesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCalculationRateDto: UpdateCalculationRateDto) {
    return this.calculationRatesService.update(+id, updateCalculationRateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.calculationRatesService.remove(+id);
  }
}
