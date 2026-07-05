import { TestsPsicometricosService } from './tests-psicometricos.service';

const testResultadoMock = {
  pacienteId: 'p1',
  tipoTest: 't1',
  puntajeTotal: 88,
  fechaRealizacion: new Date('2026-01-01'),
};

const mockModel: any = jest.fn().mockImplementation((dto) => ({
  ...dto,
  save: jest.fn().mockResolvedValue({ ...dto, id: 'newId' }),
}));

mockModel.find = jest.fn();
mockModel.aggregate = jest.fn();
mockModel.findById = jest.fn();
mockModel.findByIdAndUpdate = jest.fn();
mockModel.findByIdAndDelete = jest.fn();

describe('TestsPsicometricosService', () => {
  let service: TestsPsicometricosService;

  beforeEach(() => {
    service = new TestsPsicometricosService(mockModel as any);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('registrarResultado: crea un nuevo resultado de prueba', async () => {
    const createDto = {
      tipoTest: 't1',
      puntajeTotal: 89,
      fechaRealizacion: new Date('2026-02-01'),
    };

    const created = await service.registrarResultado('p1', createDto as any);

    expect(mockModel).toHaveBeenCalledWith({ pacienteId: 'p1', ...createDto });
    expect(created).toEqual({ pacienteId: 'p1', ...createDto, id: 'newId' });
  });

  it('obtenerHistorialPaciente: debe retornar resultados filtrados por paciente', async () => {
    mockModel.find.mockReturnValue({
      sort: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue([testResultadoMock]) }),
    });

    const res = await service.obtenerHistorialPaciente('p1');

    expect(mockModel.find).toHaveBeenCalledWith({ pacienteId: 'p1' });
    expect(res).toEqual([testResultadoMock]);
  });

  it('obtenerPromediosMensualesPorTest: agrega por test y mes', async () => {
    mockModel.aggregate.mockReturnValue({ exec: jest.fn().mockResolvedValue([{ tipoTest: 't1', promedioPuntaje: 88 }]) });

    const res = await service.obtenerPromediosMensualesPorTest('t1');

    expect(mockModel.aggregate).toHaveBeenCalledWith([
      {
        $match: { tipoTest: 't1' },
      },
      {
        $group: {
          _id: {
            año: { $year: '$fechaRealizacion' },
            mes: { $month: '$fechaRealizacion' },
          },
          promedioPuntaje: { $avg: '$puntajeTotal' },
          totalEvaluaciones: { $sum: 1 },
        },
      },
      {
        $sort: { '_id.año': -1, '_id.mes': -1 },
      },
    ]);
    expect(res).toEqual([{ tipoTest: 't1', promedioPuntaje: 88 }]);
  });

  it('findOne: retorna un test por id', async () => {
    mockModel.findById.mockReturnValue({ exec: jest.fn().mockResolvedValue(testResultadoMock) });

    const res = await service.findOne('id1');

    expect(mockModel.findById).toHaveBeenCalledWith('id1');
    expect(res).toEqual(testResultadoMock);
  });

  it('update: retorna el resultado actualizado', async () => {
    const updateDto = { puntaje: 92 };
    mockModel.findByIdAndUpdate.mockReturnValue({ exec: jest.fn().mockResolvedValue({ ...testResultadoMock, puntaje: 92 }) });

    const res = await service.update('id1', updateDto as any);

    expect(mockModel.findByIdAndUpdate).toHaveBeenCalledWith('id1', updateDto, { new: true });
    expect(res.puntaje).toBe(92);
  });

  it('remove: elimina el resultado y retorna deleted true', async () => {
    mockModel.findByIdAndDelete.mockReturnValue({ exec: jest.fn().mockResolvedValue(testResultadoMock) });

    const res = await service.remove('id1');

    expect(mockModel.findByIdAndDelete).toHaveBeenCalledWith('id1');
    expect(res).toEqual({ deleted: true });
  });
});
