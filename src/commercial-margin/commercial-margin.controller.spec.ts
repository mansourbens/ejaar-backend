import { Test, TestingModule } from '@nestjs/testing';
import { CommercialMarginController } from './commercial-margin.controller';
import { CommercialMarginService } from './commercial-margin.service';

describe('CommercialMarginController', () => {
  let controller: CommercialMarginController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommercialMarginController],
      providers: [CommercialMarginService],
    }).compile();

    controller = module.get<CommercialMarginController>(CommercialMarginController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
