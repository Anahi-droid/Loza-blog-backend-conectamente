import { Test, TestingModule } from '@nestjs/testing';
import { EncuestasController } from './encuestas.controller';
import { EncuestasService } from './encuestas.service';

describe('EncuestasController (unit)', () => {
  let controller: EncuestasController;
  const mockService = {
    create: jest.fn().mockResolvedValue({ id: 'e1' }),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 'e1' }),
    obtenerRespuestasPorEncuesta: jest.fn().mockResolvedValue([]),
    guardarRespuesta: jest.fn().mockResolvedValue({ id: 'r1' }),
    update: jest.fn().mockResolvedValue({ id: 'e1', titulo: 'upd' }),
    remove: jest.fn().mockResolvedValue({ eliminado: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EncuestasController],
      providers: [{ provide: EncuestasService, useValue: mockService }],
    }).compile();

    controller = module.get<EncuestasController>(EncuestasController);
  });

  it('create: llama al servicio y retorna resultado', async () => {
    const dto = { titulo: 'T' };
    const res = await controller.create(dto as any);
    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ id: 'e1' });
  });

  it('findAll: llama al servicio', async () => {
    const res = await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
    expect(Array.isArray(res)).toBe(true);
  });

  it('obtenerRespuestasPorEncuesta: llama al servicio con id', async () => {
    const res = await controller.obtenerRespuestasPorEncuesta('e1');
    expect(mockService.obtenerRespuestasPorEncuesta).toHaveBeenCalledWith('e1');
  });

  it('guardarRespuesta: llama al servicio con encuestaId y dto', async () => {
    const dto = { usuarioId: 'u1', respuestas: [] };
    const res = await controller.guardarRespuesta('e1', dto as any);
    expect(mockService.guardarRespuesta).toHaveBeenCalledWith('e1', dto.usuarioId, dto.respuestas);
    expect(res).toEqual({ id: 'r1' });
  });

  it('update y remove: llaman a servicios correspondientes', async () => {
    const upd = await controller.update('e1', { titulo: 'x' } as any);
    expect(mockService.update).toHaveBeenCalledWith('e1', { titulo: 'x' });
    const del = await controller.remove('e1');
    expect(mockService.remove).toHaveBeenCalledWith('e1');
    expect(del).toEqual({ eliminado: true });
  });
});
