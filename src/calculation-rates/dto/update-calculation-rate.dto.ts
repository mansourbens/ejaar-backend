import { PartialType } from '@nestjs/mapped-types';
import { CreateCalculationRateDto } from './create-calculation-rate.dto';

export class UpdateCalculationRateDto extends PartialType(CreateCalculationRateDto) {}
