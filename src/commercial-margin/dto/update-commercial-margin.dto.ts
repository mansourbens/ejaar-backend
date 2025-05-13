import { PartialType } from '@nestjs/mapped-types';
import { CreateCommercialMarginDto } from './create-commercial-margin.dto';

export class UpdateCommercialMarginDto extends PartialType(CreateCommercialMarginDto) {}
