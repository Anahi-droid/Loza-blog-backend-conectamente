import { Test, TestingModule } from '@nestjs/testing';
import { HistorialService } from './historial.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Historial } from './historial.entity';
import { Diagnostico } from './diagnostico.entity';
import { NotFoundException } from '@nestjs/common';

describe('HistorialService', () => {
  let service: HistorialService;
  let historialRepo: Repository<Historial>;
  let diagnosticoRepo: Repository<Diagnostico>;

  const mockHistorialRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    merge: jest.fn(),
    remove: jest.fn(),
  };

  const mockDiagnosticoRepo = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistorialService,
        { provide: getRepositoryToken(Historial), useValue: mockHistorialRepo },
        { provide: getRepositoryToken(Diagnostico), useValue: mockDiagnosticoRepo },
      ],
    }).compile();

    service = module.get<HistorialService>(HistorialService);
    historialRepo = module.get<Repository<Historial>>(getRepositoryToken(Historial));
    diagnosticoRepo = module.get<Repository<Diagnostico>>(getRepositoryToken(Diagnostico));
    jest.clearAllMocks();
  });

  describe('Historiales Clínicos - Operaciones Principales', () => {
    it('create() debe crear y guardar un nuevo historial correctamente', async () => {
      const dto = { fechaSesion: '2026-07-02', diagnostico: 'Ansiedad', observaciones: 'Estable', pacienteId: 'p-1' };
      const mockResult = { id: 'h-1', ...dto, psicologo: { id: 'psico-1' } };

      mockHistorialRepo.create.mockReturnValue(mockResult);
      mockHistorialRepo.save.mockResolvedValue(mockResult);

      const resultado = await service.create(dto, 'psico-1');

      expect(mockHistorialRepo.create).toHaveBeenCalled();
      expect(mockHistorialRepo.save).toHaveBeenCalledWith(mockResult);
      expect(resultado).toEqual(mockResult);
    });

    it('findAll() debe listar todos los expedientes de historiales con sus relaciones (Línea 30)', async () => {
      mockHistorialRepo.find.mockResolvedValue([]);
      
      const resultado = await service.findAll();
      
      expect(mockHistorialRepo.find).toHaveBeenCalledWith({
        relations: { paciente: true, psicologo: true }
      });
      expect(resultado).toEqual([]);
    });

    it('findOne() debe lanzar NotFoundException si el historial no existe', async () => {
      mockHistorialRepo.findOne.mockResolvedValue(null);

      await expect(service.findOne('id-falso')).rejects.toThrow(NotFoundException);
    });

    it('update() debe fusionar campos del DTO y guardar el historial modificado (Líneas 45-54)', async () => {
      const historialExistente = { 
        id: 'h-1', 
        fechaSesion: new Date('2026-07-01'), 
        diagnostico: 'Estrés', 
        observaciones: 'Ninguna', 
        paciente: { id: 'pac-1' } 
      };
      const dtoActualizacion = { 
        diagnostico: 'Estrés Agudo', 
        observaciones: 'Requiere seguimiento continuo',
        pacienteId: 'pac-2'
      };

      mockHistorialRepo.findOne.mockResolvedValue(historialExistente);
      mockHistorialRepo.merge.mockImplementation((orig, dest) => ({ ...orig, ...dest }));
      mockHistorialRepo.save.mockImplementation(async (h) => h);

      const resultado = await service.update('h-1', dtoActualizacion);

      expect(mockHistorialRepo.findOne).toHaveBeenCalledWith({
        where: { id: 'h-1' },
        relations: { paciente: true, psicologo: true }
      });
      expect(mockHistorialRepo.merge).toHaveBeenCalled();
      expect(resultado.diagnostico).toBe('Estrés Agudo');
      expect(resultado.observaciones).toBe('Requiere seguimiento continuo');
      expect(mockHistorialRepo.save).toHaveBeenCalled();
    });

    it('remove() debe eliminar el historial y retornar confirmación estructurada', async () => {
      const historialMock = { id: 'h-1' };
      mockHistorialRepo.findOne.mockResolvedValue(historialMock);
      mockHistorialRepo.remove.mockResolvedValue(historialMock);

      const resultado = await service.remove('h-1');

      expect(mockHistorialRepo.remove).toHaveBeenCalledWith(historialMock);
      expect(resultado).toEqual({ deleted: true, id: 'h-1' });
    });
  });

  describe('Diagnósticos Clínicos - Gestión CIE-10', () => {
    it('createDiagnostico() debe asociar un diagnóstico al historial clínico existente', async () => {
      const historialMock = { id: 'h-1' };
      const diagnosticoMock = { id: 'd-1', codigoCIE10: 'F41.1', descripcion: 'Ansiedad generalizada', historial: historialMock };

      mockHistorialRepo.findOne.mockResolvedValue(historialMock);
      mockDiagnosticoRepo.create.mockReturnValue(diagnosticoMock);
      mockDiagnosticoRepo.save.mockResolvedValue(diagnosticoMock);

      const resultado = await service.createDiagnostico('h-1', 'F41.1', 'Ansiedad generalizada');

      expect(mockDiagnosticoRepo.create).toHaveBeenCalled();
      expect(mockDiagnosticoRepo.save).toHaveBeenCalledWith(diagnosticoMock);
      expect(resultado).toEqual(diagnosticoMock);
    });

    it('findAllDiagnosticos() debe retornar el listado completo de CIE-10 con relaciones (Línea 74)', async () => {
      mockDiagnosticoRepo.find.mockResolvedValue([]);

      const resultado = await service.findAllDiagnosticos();

      expect(mockDiagnosticoRepo.find).toHaveBeenCalledWith({
        relations: { historial: true }
      });
      expect(resultado).toEqual([]);
    });

    it('findOneDiagnostico() debe lanzar NotFoundException si el diagnóstico no existe', async () => {
      mockDiagnosticoRepo.findOne.mockResolvedValue(null);

      await expect(service.findOneDiagnostico('d-falso')).rejects.toThrow(NotFoundException);
    });

    it('updateDiagnostico() debe modificar selectivamente las propiedades enviadas', async () => {
      const diagnosticoOriginal = { id: 'd-1', codigoCIE10: 'F41.1', descripcion: 'Ansiedad original' };
      mockDiagnosticoRepo.findOne.mockResolvedValue(diagnosticoOriginal);
      mockDiagnosticoRepo.save.mockImplementation(async (d) => d);

      const resultado = await service.updateDiagnostico('d-1', undefined, 'Nueva descripción modificada');

      expect(resultado.descripcion).toBe('Nueva descripción modificada');
      expect(resultado.codigoCIE10).toBe('F41.1');
      expect(mockDiagnosticoRepo.save).toHaveBeenCalled();
    });

    it('removeDiagnostico() debe eliminar el registro de diagnóstico de la base de datos', async () => {
      const diagnosticoMock = { id: 'd-1' };
      mockDiagnosticoRepo.findOne.mockResolvedValue(diagnosticoMock);
      mockDiagnosticoRepo.remove.mockResolvedValue(diagnosticoMock);

      const resultado = await service.removeDiagnostico('d-1');

      expect(mockDiagnosticoRepo.remove).toHaveBeenCalledWith(diagnosticoMock);
      expect(resultado).toEqual({ deleted: true, id: 'd-1' });
    });
  });
});