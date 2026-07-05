import { RecomendacionesService } from './recomendaciones.service';

describe('RecomendacionesService (unit)', () => {
  let service: RecomendacionesService;

  const recomendacion = { id: 'r1', texto: 'Be happy', paciente: { id: 'p1' }, psicologo: { id: 'ps1' } };

  const repoMock: any = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'r1', ...dto })),
    save: jest.fn().mockResolvedValue(recomendacion),
    find: jest.fn().mockResolvedValue([recomendacion]),
    findOne: jest.fn().mockResolvedValue(recomendacion),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(() => {
    service = new RecomendacionesService(repoMock as any);
  });

  it('create: delega en repository.save', async () => {
    const dto = { texto: 'Be happy', pacienteId: 'p1' };
    const res = await service.create(dto as any);
    expect(repoMock.create).toHaveBeenCalled();
    expect(res).toEqual(recomendacion);
  });

  it('findAll: retorna array', async () => {
    const res = await service.findAll();
    expect(Array.isArray(res)).toBe(true);
  });

  it('findOne: retorna o lanza NotFound', async () => {
    const res = await service.findOne('r1');
    expect(res.id).toBe('r1');
  });

  it('findOne: lanza NotFound cuando no existe', async () => {
    repoMock.findOne.mockResolvedValue(null);
    await expect(service.findOne('no-existe')).rejects.toThrow();
  });

  it('update: delega en repository.save y retorna la recomendación actualizada', async () => {
    const dto = { texto: 'Be updated' };
    repoMock.findOne.mockResolvedValue(recomendacion);
    repoMock.save.mockResolvedValue({ ...recomendacion, texto: 'Be updated' });

    const res = await service.update('r1', dto as any);

    expect(repoMock.findOne).toHaveBeenCalledWith({
      where: { id: 'r1' },
      relations: { paciente: true, psicologo: true },
    });
    expect(repoMock.save).toHaveBeenCalled();
    expect(res.texto).toBe('Be updated');
  });

  it('remove: delega en repository.remove y retorna deleted true', async () => {
    repoMock.findOne.mockResolvedValue(recomendacion);
    repoMock.remove.mockResolvedValue(undefined);

    const res = await service.remove('r1');

    expect(repoMock.findOne).toHaveBeenCalledWith({
      where: { id: 'r1' },
      relations: { paciente: true, psicologo: true },
    });
    expect(repoMock.remove).toHaveBeenCalledWith(recomendacion);
    expect(res).toEqual({ deleted: true, id: 'r1' });
  });
});

