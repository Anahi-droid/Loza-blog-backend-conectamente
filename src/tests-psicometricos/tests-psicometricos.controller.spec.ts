import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException } from '@nestjs/common';
import { TestsPsicometricosController } from './tests-psicometricos.controller';
import { TestsPsicometricosService } from './tests-psicometricos.service';

describe('TestsPsicometricosController (unit)', () => {
  let controller: TestsPsicometricosController;
  const mockService = {
    registrarResultado: jest.fn().mockResolvedValue({ id: 't1' }),
    obtenerHistorialPaciente: jest.fn().mockResolvedValue([]),
    obtenerPromediosMensualesPorTest: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 't1', pacienteId: 'u1' }),
    update: jest.fn().mockResolvedValue({ id: 't1', comentario: 'upd' }),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestsPsicometricosController],
      providers: [{ provide: TestsPsicometricosService, useValue: mockService }],
    }).compile();

    controller = module.get<TestsPsicometricosController>(TestsPsicometricosController);
  });

  it('guardarTest: delega en servicio con req.user.id', async () => {
    const req: any = { user: { id: 'u1' } };
    const dto = { pacienteId: 'u1', puntajeTotal: 90 };

    const res = await controller.guardarTest(req, dto as any);

    expect(mockService.registrarResultado).toHaveBeenCalledWith('u1', dto);
    expect(res).toEqual({ id: 't1' });
  });

  it('verMisResultados: delega en servicio con req.user.id', async () => {
    const req: any = { user: { id: 'u1' } };
    await controller.verMisResultados(req);
    expect(mockService.obtenerHistorialPaciente).toHaveBeenCalledWith('u1');
  });

  it('findOne: retorna resultado si el usuario es el paciente', async () => {
    const req: any = { user: { id: 'u1', rol: 'PACIENTE' } };
    const res = await controller.findOne(req, 't1');
    expect(mockService.findOne).toHaveBeenCalledWith('t1');
    expect(res).toEqual({ id: 't1', pacienteId: 'u1' });
  });

  it('update: delega en servicio cuando es el paciente dueño', async () => {
    const req: any = { user: { id: 'u1', rol: 'PACIENTE' } };
    const dto = { comentario: 'actualizado' };
    const res = await controller.update(req, 't1', dto as any);
    expect(mockService.findOne).toHaveBeenCalledWith('t1');
    expect(mockService.update).toHaveBeenCalledWith('t1', dto);
    expect(res).toEqual({ id: 't1', comentario: 'upd' });
  });

  it('remove: delega en servicio cuando es el paciente dueño', async () => {
    const req: any = { user: { id: 'u1', rol: 'PACIENTE' } };
    const res = await controller.remove(req, 't1');
    expect(mockService.findOne).toHaveBeenCalledWith('t1');
    expect(mockService.remove).toHaveBeenCalledWith('t1');
    expect(res).toEqual({ deleted: true });
  });

  it('obtenerEstadisticas: lanza ForbiddenException para rol no autorizado', async () => {
    const req: any = { user: { rol: 'PACIENTE' } };
    await expect(controller.obtenerEstadisticas(req, 'cognitive')).rejects.toThrow(ForbiddenException);
  });
});
