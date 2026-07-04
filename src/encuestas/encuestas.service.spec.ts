import { EncuestasService } from './encuestas.service';

describe('EncuestasService (unit)', () => {
  let service: EncuestasService;

  const encuestaSaved = { _id: 'e1', titulo: 'Test' };
  const respuestaSaved = { _id: 'r1', encuestaId: 'e1', usuarioId: 'u1', respuestas: [] };

  function EncuestaModelMock(data?: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue({ _id: 'e1', ...data });
  }
  EncuestaModelMock.find = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([encuestaSaved]) });
  EncuestaModelMock.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(encuestaSaved) });
  EncuestaModelMock.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue({ ...encuestaSaved, titulo: 'updated' }) });
  EncuestaModelMock.findByIdAndDelete = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(encuestaSaved) });

  function RespuestaModelMock(data?: any) {
    Object.assign(this, data);
    this.save = jest.fn().mockResolvedValue(respuestaSaved);
  }
  RespuestaModelMock.find = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([respuestaSaved]) });

  beforeEach(() => {
    service = new EncuestasService(EncuestaModelMock as any, RespuestaModelMock as any);
  });

  it('create: crea y retorna encuesta', async () => {
    const res = await service.create({ titulo: 'Test' } as any);
    expect(res._id).toBe('e1');
  });

  it('findAll: retorna array', async () => {
    const res = await service.findAll();
    expect(Array.isArray(res)).toBe(true);
  });

  it('findOne: retorna encuesta o lanza NotFound', async () => {
    const res = await service.findOne('e1');
    expect(res._id).toBe('e1');
  });

  it('findOne: lanza NotFound cuando no existe', async () => {
    (EncuestaModelMock.findById as jest.Mock).mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
    await expect(service.findOne('no-existe')).rejects.toThrow();
  });

  it('guardarRespuesta: guarda respuesta', async () => {
    const res = await service.guardarRespuesta('e1', 'u1', []);
    expect(res._id).toBe('r1');
  });
});
