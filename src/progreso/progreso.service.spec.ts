import { Test, TestingModule } from '@nestjs/testing';
import { ProgresoService } from './progreso.service';

describe('ProgresoService', () => {
  let service: ProgresoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProgresoService],
    }).compile();

    service = module.get<ProgresoService>(ProgresoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
