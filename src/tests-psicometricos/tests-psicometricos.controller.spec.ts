import { Test, TestingModule } from '@nestjs/testing';
import { TestsPsicometricosController } from './tests-psicometricos.controller';
import { TestsPsicometricosService } from './tests-psicometricos.service';

describe('TestsPsicometricosController (unit)', () => {
  let controller: TestsPsicometricosController;
  const mockService = {
    create: jest.fn().mockResolvedValue({ id: 't1' }),
    findAll: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 't1' }),
    update: jest.fn().mockResolvedValue({ id: 't1', nombre: 'upd' }),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TestsPsicometricosController],
      providers: [{ provide: TestsPsicometricosService, useValue: mockService }],
    }).compile();

    controller = module.get<TestsPsicometricosController>(TestsPsicometricosController);
  });

  it('create: delega en servicio', async () => {
    const dto = { nombre: 'T' };
    const res = await controller.create(dto as any);
    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ id: 't1' });
  });

  it('findAll y findOne', async () => {
    await controller.findAll();
    expect(mockService.findAll).toHaveBeenCalled();
    const one = await controller.findOne('t1');
    expect(mockService.findOne).toHaveBeenCalledWith('t1');
    expect(one).toEqual({ id: 't1' });
  });

  it('update y remove', async () => {
    const up = await controller.update('t1', { nombre: 'u' } as any);
    expect(mockService.update).toHaveBeenCalledWith('t1', { nombre: 'u' });
    const del = await controller.remove('t1');
    expect(mockService.remove).toHaveBeenCalledWith('t1');
    expect(del).toEqual({ deleted: true });
  });
});
