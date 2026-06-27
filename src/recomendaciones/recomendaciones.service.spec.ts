import { Test, TestingModule } from '@nestjs/testing';
import { RecomendacionesService } from './recomendaciones.service';

describe('RecomendacionesService', () => {
  let service: RecomendacionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RecomendacionesService],
    }).compile();

    service = module.get<RecomendacionesService>(RecomendacionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
