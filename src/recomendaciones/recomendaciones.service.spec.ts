import { Test, TestingModule } from '@nestjs/testing';
import { RecomendacionesService } from './recomendaciones.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Recomendacion } from './recomendacion.entity';
import { Progreso } from '../progreso/progreso.entity';
import { NotFoundException } from '@nestjs/common';

describe('RecomendacionesService', () => {
  let service: RecomendacionesService;

  const mockRecomendacion = {
    id: 'r1',
    fecha: new Date(),
    titulo: 'Recomendación Test',
    descripcion: 'Be happy',
    paciente: { id: 'p1' },
    psicologo: { id: 'ps1' },
  };

  const mockProgreso = {
    id: 'pr-123',
    fecha: new Date(),
    estadoEmocional: 'Estable',
    avance: 'Favorable',
    observaciones: 'Sin novedades',
    historial: { id: 'h-1' },
  };

  const mockRecomendacionRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'r1', ...dto })),
    save: jest.fn().mockResolvedValue(mockRecomendacion),
    find: jest.fn().mockResolvedValue([mockRecomendacion]),
    findOne: jest.fn().mockResolvedValue(mockRecomendacion),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  const mockProgresoRepo = {
    create: jest.fn().mockImplementation((dto) => ({ id: 'pr-123', ...dto })),
    save: jest.fn().mockImplementation(async (progreso) => progreso), 
    find: jest.fn().mockResolvedValue([mockProgreso]),
    findOne: jest.fn().mockResolvedValue(mockProgreso),
    remove: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecomendacionesService,
        { provide: getRepositoryToken(Recomendacion), useValue: mockRecomendacionRepo },
        { provide: getRepositoryToken(Progreso), useValue: mockProgresoRepo },
      ],
    }).compile();

    service = module.get<RecomendacionesService>(RecomendacionesService);
    jest.clearAllMocks();
  });

  describe('Gestión de Recomendaciones', () => {
    it('create: debe estructurar y almacenar una recomendación', async () => {
      const dto = { fecha: new Date(), titulo: 'Test', descripcion: 'Be happy', pacienteId: 'p1' };
      const res = await service.create(dto as any, 'ps1');
      expect(mockRecomendacionRepo.create).toHaveBeenCalled();
      expect(res).toEqual(mockRecomendacion);
    });

    it('findAll: debe retornar un arreglo de recomendaciones', async () => {
      const res = await service.findAll();
      expect(mockRecomendacionRepo.find).toHaveBeenCalled();
      expect(Array.isArray(res)).toBe(true);
    });

    it('findOne: debe retornar el objeto si existe', async () => {
      const res = await service.findOne('r1');
      expect(res.id).toBe('r1');
    });

    it('findOne: debe lanzar NotFoundException si no se encuentra', async () => {
      mockRecomendacionRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('no-existe')).rejects.toThrow(NotFoundException);
    });

    it('findByPaciente: debe filtrar de forma correcta por pacienteId (Línea 46)', async () => {
      mockRecomendacionRepo.find.mockResolvedValue([mockRecomendacion]);
      
      const res = await service.findByPaciente('p1');
      
      expect(mockRecomendacionRepo.find).toHaveBeenCalledWith({
        where: { paciente: { id: 'p1' } },
        relations: { psicologo: true, paciente: true },
      });
      expect(res).toEqual([mockRecomendacion]);
    });

    it('update: debe mezclar propiedades y guardar cambios', async () => {
      const dto = { titulo: 'Nuevo Titulo', pacienteId: 'p2' };
      mockRecomendacionRepo.findOne.mockResolvedValue(mockRecomendacion);
      mockRecomendacionRepo.create.mockReturnValue({ ...mockRecomendacion, ...dto, paciente: { id: 'p2' } });

      await service.update('r1', dto as any);

      expect(mockRecomendacionRepo.save).toHaveBeenCalled();
    });

    it('remove: debe eliminar la entidad y confirmar', async () => {
      mockRecomendacionRepo.findOne.mockResolvedValue(mockRecomendacion);
      const res = await service.remove('r1');
      expect(mockRecomendacionRepo.remove).toHaveBeenCalledWith(mockRecomendacion);
      expect(res).toEqual({ deleted: true, id: 'r1' });
    });
  });

  describe('Gestión de Progresos (Líneas 72-108)', () => {
    it('createProgreso: debe insertar un nuevo hito de avance', async () => {
      const fechaTest = new Date();
      const res = await service.createProgreso('h-1', fechaTest, 'Triste', 'Bajo', 'Ninguna');
      
      expect(mockProgresoRepo.create).toHaveBeenCalled();
      expect(res).toEqual({
        id: 'pr-123',
        fecha: fechaTest,
        estadoEmocional: 'Triste',
        avance: 'Bajo',
        observaciones: 'Ninguna',
        historial: { id: 'h-1' }
      });
    });

    it('findAllProgresos: debe listar todos los progresos registrados', async () => {
      const res = await service.findAllProgresos();
      expect(mockProgresoRepo.find).toHaveBeenCalledWith({ relations: { historial: true } });
      expect(res).toEqual([mockProgreso]);
    });

    it('findOneProgreso: debe retornar el progreso o lanzar error si no existe', async () => {
      const res = await service.findOneProgreso('pr-123');
      expect(res.id).toBe('pr-123');

      mockProgresoRepo.findOne.mockResolvedValue(null);
      await expect(service.findOneProgreso('pr-falso')).rejects.toThrow(NotFoundException);
    });

    it('updateProgreso: debe aplicar cambios opcionales selectivamente', async () => {
      mockProgresoRepo.findOne.mockResolvedValue({ ...mockProgreso });
      
      const res = await service.updateProgreso('pr-123', 'Eufórico', 'Alto', 'Modificado');
      
      expect(res.estadoEmocional).toBe('Eufórico');
      expect(res.avance).toBe('Alto');
      expect(res.observaciones).toBe('Modificado');
      expect(mockProgresoRepo.save).toHaveBeenCalled();
    });

    it('removeProgreso: debe dar de baja el registro', async () => {
      mockProgresoRepo.findOne.mockResolvedValue(mockProgreso);
      const res = await service.removeProgreso('pr-123');
      expect(mockProgresoRepo.remove).toHaveBeenCalledWith(mockProgreso);
      expect(res).toEqual({ deleted: true, id: 'pr-123' });
    });
  });
});