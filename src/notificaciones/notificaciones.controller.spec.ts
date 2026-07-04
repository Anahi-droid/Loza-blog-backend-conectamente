import { Test, TestingModule } from '@nestjs/testing';
import { NotificacionesController } from './notificaciones.controller';
import { NotificacionesService } from './notificaciones.service';

describe('NotificacionesController (unit)', () => {
  let controller: NotificacionesController;
  const mockService = {
    create: jest.fn().mockResolvedValue({ id: 'n1', titulo: 'Hola' }),
    findByUsuario: jest.fn().mockResolvedValue([]),
    findOne: jest.fn().mockResolvedValue({ id: 'n1' }),
    marcarComoLeida: jest.fn().mockResolvedValue({ id: 'n1', leido: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NotificacionesController],
      providers: [{ provide: NotificacionesService, useValue: mockService }],
    }).compile();

    controller = module.get<NotificacionesController>(NotificacionesController);
  });

  it('create: llama al servicio y retorna la notificación', async () => {
    const dto = { titulo: 'Hola', cuerpo: 'mundo' };
    const res = await controller.create(dto as any);
    expect(mockService.create).toHaveBeenCalledWith(dto);
    expect(res).toEqual({ id: 'n1', titulo: 'Hola' });
  });

  it('findByUsuario: retorna array', async () => {
    const res = await controller.findByUsuario('u1');
    expect(mockService.findByUsuario).toHaveBeenCalledWith('u1');
    expect(Array.isArray(res)).toBe(true);
  });

  it('marcarComoLeida: llama al servicio', async () => {
    const res = await controller.marcarComoLeida('n1');
    expect(mockService.marcarComoLeida).toHaveBeenCalledWith('n1');
    expect(res).toEqual({ id: 'n1', leido: true });
  });
});
