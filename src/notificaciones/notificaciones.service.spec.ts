import { NotFoundException } from '@nestjs/common';
import { NotificacionesService } from './notificaciones.service';

describe('NotificacionesService (unit)', () => {
  let service: NotificacionesService;
  let modelMock: any;

  const notificacion = {
    _id: 'n1',
    usuarioId: 'u1',
    titulo: 'Alerta',
    cuerpo: 'Tienes una nueva notificación',
    leido: false,
  };

  beforeEach(() => {
    modelMock = {
      find: jest.fn().mockReturnValue({ sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([notificacion]) }) }),
      findByIdAndUpdate: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ ...notificacion, leido: true }) }),
      findById: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(notificacion) }),
      findByIdAndDelete: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(notificacion) }),
    };

    const NotificationModelMock = function (this: any, data?: any) {
      Object.assign(this, data);
      this.save = jest.fn().mockResolvedValue({ _id: 'n1', ...data });
    } as any;

    NotificationModelMock.find = modelMock.find;
    NotificationModelMock.findByIdAndUpdate = modelMock.findByIdAndUpdate;
    NotificationModelMock.findById = modelMock.findById;
    NotificationModelMock.findByIdAndDelete = modelMock.findByIdAndDelete;

    service = new NotificacionesService(NotificationModelMock);
  });

  it('create: debe guardar y retornar la notificación', async () => {
    const dto = { usuarioId: 'u1', titulo: 'Alerta', cuerpo: 'Hola' };
    const result = await service.create(dto as any);

    expect(result).toEqual({ _id: 'n1', ...dto });
  });

  it('findByUsuario: debe retornar lista de notificaciones', async () => {
    const result = await service.findByUsuario('u1');

    expect(modelMock.find).toHaveBeenCalledWith({ usuarioId: 'u1' });
    expect(result).toEqual([notificacion]);
  });

  it('marcarComoLeida: debe marcar como leída si existe', async () => {
    const result = await service.marcarComoLeida('n1');

    expect(modelMock.findByIdAndUpdate).toHaveBeenCalledWith('n1', { leido: true }, { new: true });
    expect(result.leido).toBe(true);
  });

  it('marcarComoLeida: debe lanzar NotFoundException si no existe', async () => {
    modelMock.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.marcarComoLeida('n-noexiste')).rejects.toThrow(NotFoundException);
  });

  it('findOne: debe retornar la notificación por id', async () => {
    const result = await service.findOne('n1');
    expect(modelMock.findById).toHaveBeenCalledWith('n1');
    expect(result).toEqual(notificacion);
  });

  it('findAll: debe retornar todas las notificaciones', async () => {
    const result = await service.findAll();
    expect(modelMock.find).toHaveBeenCalledWith();
    expect(result).toEqual([notificacion]);
  });

  it('update: debe actualizar y retornar la notificación', async () => {
    const dto = { titulo: 'Actualizado' };
    const result = await service.update('n1', dto as any);

    expect(modelMock.findByIdAndUpdate).toHaveBeenCalledWith('n1', dto, { new: true });
    expect(result).toEqual({ ...notificacion, leido: true });
  });

  it('update: debe lanzar NotFoundException si no existe', async () => {
    modelMock.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.update('n-noexiste', { titulo: 'x' } as any)).rejects.toThrow(NotFoundException);
  });

  it('remove: debe retornar deleted true si se elimina', async () => {
    const result = await service.remove('n1');
    expect(modelMock.findByIdAndDelete).toHaveBeenCalledWith('n1');
    expect(result).toEqual({ deleted: true });
  });

  it('remove: debe retornar deleted false si no se elimina', async () => {
    modelMock.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    const result = await service.remove('n-noexiste');
    expect(result).toEqual({ deleted: false });
  });
});
