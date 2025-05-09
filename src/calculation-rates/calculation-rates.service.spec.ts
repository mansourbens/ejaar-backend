import { Test, TestingModule } from '@nestjs/testing';
import { CalculationRatesService } from './calculation-rates.service';

describe('CalculationRatesService', () => {
  let service: CalculationRatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalculationRatesService],
    }).compile();

    service = module.get<CalculationRatesService>(CalculationRatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
