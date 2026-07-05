import { ChatsService } from './chats.service';

describe('ChatsService (unit)', () => {
  let service: ChatsService;
  let chatModelMock: any;

  const messageSaved = {
    _id: 'm1',
    remitenteId: 'u1',
    destinatarioId: 'u2',
    mensaje: 'hola',
  };

  beforeEach(() => {
    chatModelMock = {
      find: jest.fn().mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue([messageSaved]),
        }),
      }),
      findById: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...messageSaved,
          save: jest.fn().mockResolvedValue({ ...messageSaved, mensaje: 'edit' }),
        }),
      }),
      deleteOne: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) }),
    };

    const ChatModelMock = function (this: any, data?: any) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue({ _id: 'm1', ...data });
    } as any;

    ChatModelMock.find = chatModelMock.find;
    ChatModelMock.findById = chatModelMock.findById;
    ChatModelMock.deleteOne = chatModelMock.deleteOne;

    service = new ChatsService(ChatModelMock);
  });

  it('enviarMensaje: guarda y retorna el mensaje', async () => {
    const dto = { destinatarioId: 'u2', mensaje: 'hola' };
    const res = await service.enviarMensaje('u1', dto as any);
    expect(res).toBeDefined();
    expect(res.mensaje).toEqual('hola');
  });

  it('obtenerHistorial: retorna array de mensajes', async () => {
    const res = await service.obtenerHistorial('u1', 'u2');
    expect(Array.isArray(res)).toBe(true);
    expect(res?.[0]?.remitenteId).toBe('u1');
  });

  it('actualizarMensaje: si existe y remitente coincide, guarda cambio', async () => {
    const res = await service.actualizarMensaje('u1', 'm1', { mensaje: 'edit' } as any);
    expect(res).toBeDefined();
    expect(res.mensaje).toEqual('edit');
  });

  it('actualizarMensaje: retorna null si el mensaje no existe', async () => {
    chatModelMock.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const res = await service.actualizarMensaje('u1', 'm-not-found', { mensaje: 'x' } as any);
    expect(res).toBeNull();
  });

  it('eliminarMensaje: retorna deleted true cuando existe y remitente coincide', async () => {
    const res = await service.eliminarMensaje('u1', 'm1');
    expect(res).toEqual({ deleted: true });
  });

  it('eliminarMensaje: retorna deleted false si no existe', async () => {
    chatModelMock.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const res = await service.eliminarMensaje('u1', 'm-not-found');
    expect(res).toEqual({ deleted: false });
  });
});
