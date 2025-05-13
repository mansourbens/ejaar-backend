import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommercialMarginService } from './commercial-margin.service';
import { CreateCommercialMarginDto } from './dto/create-commercial-margin.dto';
import { UpdateCommercialMarginDto } from './dto/update-commercial-margin.dto';

@Controller('commercial-margin')
export class CommercialMarginController {
  constructor(private readonly commercialMarginService: CommercialMarginService) {}

  @Post()
  create(@Body() createCommercialMarginDto: CreateCommercialMarginDto) {
    return this.commercialMarginService.create(createCommercialMarginDto);
  }

  @Get()
  findAll() {
    return this.commercialMarginService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.commercialMarginService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommercialMarginDto: UpdateCommercialMarginDto) {
    return this.commercialMarginService.update(+id, updateCommercialMarginDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.commercialMarginService.remove(+id);
  }
}
