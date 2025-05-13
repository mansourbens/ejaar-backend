import { Test, TestingModule } from '@nestjs/testing';
import { ResidualConfigController } from './residual-config.controller';
import { ResidualConfigService } from './residual-config.service';

describe('ResidualConfigController', () => {
  let controller: ResidualConfigController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResidualConfigController],
      providers: [ResidualConfigService],
    }).compile();

    controller = module.get<ResidualConfigController>(ResidualConfigController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
