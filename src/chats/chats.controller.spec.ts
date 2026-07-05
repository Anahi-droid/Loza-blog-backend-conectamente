import { Test, TestingModule } from '@nestjs/testing';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';

describe('ChatsController (unit)', () => {
  let controller: ChatsController;
  const mockService = {
    enviarMensaje: jest.fn().mockResolvedValue({ id: 'm1', mensaje: 'hola' }),
    obtenerHistorial: jest.fn().mockResolvedValue([]),
    actualizarMensaje: jest.fn().mockResolvedValue({ id: 'm1', mensaje: 'edit' }),
    eliminarMensaje: jest.fn().mockResolvedValue({ deleted: true }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [{ provide: ChatsService, useValue: mockService }],
    }).compile();

    controller = module.get<ChatsController>(ChatsController);
  });

  it('guardarMensaje: debe llamar al servicio con req.user.id y dto', async () => {
    const req: any = { user: { id: 'u1' } };
    const dto = { destinatarioId: 'u2', mensaje: 'hola' };
    const res = await controller.guardarMensaje(req, dto as any);
    expect(mockService.enviarMensaje).toHaveBeenCalledWith('u1', dto);
    expect(res).toEqual({ id: 'm1', mensaje: 'hola' });
  });

  it('obtenerHistorial: debe llamar al servicio pasando req.user.id y param', async () => {
    const req: any = { user: { id: 'u1' } };
    const res = await controller.obtenerHistorial(req, 'u2');
    expect(mockService.obtenerHistorial).toHaveBeenCalledWith('u1', 'u2');
  });

  it('actualizarMensaje: debe llamar servicio con id y dto', async () => {
    const req: any = { user: { id: 'u1' } };
    const res = await controller.actualizarMensaje(req, 'm1', { mensaje: 'edit' } as any);
    expect(mockService.actualizarMensaje).toHaveBeenCalledWith('u1', 'm1', { mensaje: 'edit' });
  });

  it('eliminarMensaje: debe llamar servicio con id', async () => {
    const req: any = { user: { id: 'u1' } };
    const res = await controller.eliminarMensaje(req, 'm1');
    expect(mockService.eliminarMensaje).toHaveBeenCalledWith('u1', 'm1');
    expect(res).toEqual({ deleted: true });
  });
});
