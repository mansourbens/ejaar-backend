import { Test, TestingModule } from '@nestjs/testing';
import { RateConfigController } from './rate-config.controller';
import { RateConfigService } from './rate-config.service';

describe('RateConfigController', () => {
  let controller: RateConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RateConfigController],
      providers: [RateConfigService],
    }).compile();

    controller = module.get<RateConfigController>(RateConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
