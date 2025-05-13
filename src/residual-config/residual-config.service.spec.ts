import { Test, TestingModule } from '@nestjs/testing';
import { ResidualConfigService } from './residual-config.service';

describe('ResidualConfigService', () => {
  let service: ResidualConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ResidualConfigService],
    }).compile();

    service = module.get<ResidualConfigService>(ResidualConfigService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
