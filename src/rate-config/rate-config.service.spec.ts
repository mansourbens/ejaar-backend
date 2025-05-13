import { Test, TestingModule } from '@nestjs/testing';
import { RateConfigService } from './rate-config.service';

describe('RateConfigService', () => {
  let service: RateConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RateConfigService],
    }).compile();

    service = module.get<RateConfigService>(RateConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
