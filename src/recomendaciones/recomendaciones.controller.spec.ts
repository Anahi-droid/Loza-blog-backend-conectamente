import { Test, TestingModule } from '@nestjs/testing';
import { RecomendacionesController } from './recomendaciones.controller';
import { RecomendacionesService } from './recomendaciones.service';

describe('RecomendacionesController', () => {
  let controller: RecomendacionesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecomendacionesController],
      providers: [RecomendacionesService],
    }).compile();

    controller = module.get<RecomendacionesController>(RecomendacionesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
