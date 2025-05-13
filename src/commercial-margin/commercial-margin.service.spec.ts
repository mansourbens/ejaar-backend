import { Test, TestingModule } from '@nestjs/testing';
import { CommercialMarginService } from './commercial-margin.service';

describe('CommercialMarginService', () => {
  let service: CommercialMarginService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommercialMarginService],
    }).compile();

    service = module.get<CommercialMarginService>(CommercialMarginService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
