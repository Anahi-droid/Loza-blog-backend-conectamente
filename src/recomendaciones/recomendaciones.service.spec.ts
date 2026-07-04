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
});

