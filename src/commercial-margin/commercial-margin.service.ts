import { Injectable } from '@nestjs/common';
import { CreateCommercialMarginDto } from './dto/create-commercial-margin.dto';
import { UpdateCommercialMarginDto } from './dto/update-commercial-margin.dto';

@Injectable()
export class CommercialMarginService {
  create(createCommercialMarginDto: CreateCommercialMarginDto) {
    return 'This action adds a new commercialMargin';
  }

  findAll() {
    return `This action returns all commercialMargin`;
  }

  findOne(id: number) {
    return `This action returns a #${id} commercialMargin`;
  }

  update(id: number, updateCommercialMarginDto: UpdateCommercialMarginDto) {
    return `This action updates a #${id} commercialMargin`;
  }

  remove(id: number) {
    return `This action removes a #${id} commercialMargin`;
  }
}
