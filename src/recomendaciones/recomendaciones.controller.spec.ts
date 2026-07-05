import { Test, TestingModule } from '@nestjs/testing';
import { RecomendacionesController } from './recomendaciones.controller';
import { RecomendacionesService } from './recomendaciones.service';

describe('RecomendacionesController (unit)', () => {
  let controller: RecomendacionesController;
  const mockService = {
    create: jest.fn().mockResolvedValue({ id: 'r1' }),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 'r1' }),
    findByPaciente: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue({ id: 'r1', texto: 'upd' }),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecomendacionesController],
      providers: [{ provide: RecomendacionesService, useValue: mockService }],
    }).compile();

    controller = module.get<RecomendacionesController>(RecomendacionesController);
  });

  it('create: delega en servicio', async () => {
    const dto = { texto: 'x', pacienteId: 'p1' };
    const mockReq: any = { user: { psicologoId: 'ps1' } };
    const res = await controller.create(mockReq, dto as any);
    expect(mockService.create).toHaveBeenCalledWith(dto, 'ps1');
    expect(res).toEqual({ id: 'r1' });
  });

  it('findAll y findOne: llaman a servicio', async () => {
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
    const one = await controller.findOne('r1');
    expect(mockService.findOne).toHaveBeenCalledWith('r1');
    expect(one).toEqual({ id: 'r1' });
  });

  it('findByPaciente y update y remove: llaman a servicio', async () => {
    await controller.findByPaciente('p1');
    expect(mockService.findByPaciente).toHaveBeenCalledWith('p1');
    const up = await controller.update('r1', { texto: 'u' } as any);
    expect(mockService.update).toHaveBeenCalledWith('r1', { texto: 'u' });
    const del = await controller.remove('r1');
    expect(mockService.remove).toHaveBeenCalledWith('r1');
    expect(del).toEqual({ deleted: true });
  });
});

