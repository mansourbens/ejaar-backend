import { Test, TestingModule } from '@nestjs/testing';
import { CalculationRatesController } from './calculation-rates.controller';
import { CalculationRatesService } from './calculation-rates.service';

describe('CalculationRatesController', () => {
  let controller: CalculationRatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalculationRatesController],
      providers: [CalculationRatesService],
    }).compile();

    controller = module.get<CalculationRatesController>(CalculationRatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
