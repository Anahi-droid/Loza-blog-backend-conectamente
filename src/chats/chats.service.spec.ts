import { ChatsService } from './chats.service';

// Declaraciones para evitar errores de TS en el editor si no están instalados
declare const describe: any;
declare const it: any;
declare const expect: any;
declare const beforeEach: any;
declare const jest: any;

describe('ChatsService (unit)', () => {
  let service: ChatsService;

  const messageSaved = { _id: 'm1', remitenteId: 'u1', destinatarioId: 'u2', mensaje: 'hola' };

  // simple constructor-style mock for Mongoose model
  function ChatModelMock(this: any, data?: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue({ _id: 'm1', ...data });
  }

  ChatModelMock.find = jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([messageSaved]) }) });
  ChatModelMock.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ ...messageSaved, save: jest.fn().mockResolvedValue({ ...messageSaved, mensaje: 'edit' }) }) });
  ChatModelMock.deleteOne = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({}) });

  beforeEach(() => {
    service = new ChatsService(ChatModelMock as any);
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
    // temporalmente simular que findById no encuentra
    (ChatModelMock.findById as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const res = await service.actualizarMensaje('u1', 'm-not-found', { mensaje: 'x' } as any);
    expect(res).toBeNull();
  });

  it('eliminarMensaje: retorna deleted true cuando existe y remitente coincide', async () => {
    const res = await service.eliminarMensaje('u1', 'm1');
    expect(res).toEqual({ deleted: true });
  });

  it('eliminarMensaje: retorna deleted false si no existe', async () => {
    (ChatModelMock.findById as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const res = await service.eliminarMensaje('u1', 'm-not-found');
    expect(res).toEqual({ deleted: false });
  });
});
