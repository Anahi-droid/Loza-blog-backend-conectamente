import { Test, TestingModule } from '@nestjs/testing';
import { AgendasService } from './agenda.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Agenda } from './agenda.entity';
import { DisponibilidadExcepcion } from '../psicologos/disponibilidad-excepcion.entity';
import { HorarioTrabajo } from './horario-trabajo.entity';
import { BadRequestException, NotFoundException, ForbiddenException } from '@nestjs/common';

describe('AgendasService', () => {
  let service: AgendasService;

  const mockAgendaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockExcepcionRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
    createQueryBuilder: jest.fn(),
  };

  const mockHorarioRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    remove: jest.fn(),
  };

  const mockQueryBuilder = {
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getOne: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendasService,
        { provide: getRepositoryToken(Agenda), useValue: mockAgendaRepository },
        { provide: getRepositoryToken(DisponibilidadExcepcion), useValue: mockExcepcionRepository },
        { provide: getRepositoryToken(HorarioTrabajo), useValue: mockHorarioRepository },
      ],
    }).compile();

    service = module.get<AgendasService>(AgendasService);
    jest.clearAllMocks();
  });

  describe('verificarExcepcion', () => {
    it('debe lanzar BadRequestException si existe un bloque excepcional que coincida con la fecha', async () => {
      mockExcepcionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getOne.mockResolvedValue({ id: 'exc-1', motivo: 'Vacaciones médicas' });

      await expect(
        service.verificarExcepcion('psico-123', new Date()),
      ).rejects.toThrow(BadRequestException);
    });

    it('debe retornar true si no hay excepciones bloqueantes registradas', async () => {
      mockExcepcionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const resultado = await service.verificarExcepcion('psico-123', new Date());

      expect(resultado).toBe(true);
    });
  });

  describe('crearDisponibilidad', () => {
    it('debe crear y guardar un bloque de disponibilidad correctamente', async () => {
      mockExcepcionRepository.createQueryBuilder.mockReturnValue(mockQueryBuilder);
      mockQueryBuilder.getOne.mockResolvedValue(null);

      const agendaMock = { id: 'agenda-1', estaReservado: false };
      mockAgendaRepository.create.mockReturnValue(agendaMock);
      mockAgendaRepository.save.mockResolvedValue(agendaMock);

      const resultado = await service.crearDisponibilidad('psico-123', new Date());

      expect(mockAgendaRepository.save).toHaveBeenCalled();
      expect(resultado).toEqual(agendaMock);
    });
  });

  describe('Consultas y Lecturas de Disponibilidad', () => {
    it('obtenerDisponiblesPorPsicologo() debe retornar bloques no reservados', async () => {
      mockAgendaRepository.find.mockResolvedValue([]);
      const res = await service.obtenerDisponiblesPorPsicologo('psico-1');
      expect(res).toEqual([]);
    });

    it('listarTodasLasAgendas() debe retornar todos los registros con relaciones', async () => {
      mockAgendaRepository.find.mockResolvedValue([]);
      const res = await service.listarTodasLasAgendas();
      expect(res).toEqual([]);
    });

    it('buscarPorId() debe retornar null si no se provee un ID', async () => {
      const res = await service.buscarPorId('');
      expect(res).toBeNull();
    });

    it('buscarPorId() debe retornar la agenda si se provee un ID válido', async () => {
      const agendaMock = { id: 'agenda-1' };
      mockAgendaRepository.findOne.mockResolvedValue(agendaMock);
      const res = await service.buscarPorId('agenda-1');
      expect(res).toEqual(agendaMock);
    });
  });

  describe('actualizarDisponibilidad', () => {
    it('debe lanzar NotFoundException si el bloque no existe', async () => {
      mockAgendaRepository.findOne.mockResolvedValue(null);
      await expect(
        service.actualizarDisponibilidad('id-falso', 'psico-1', new Date(), true)
      ).rejects.toThrow(NotFoundException);
    });

    it('debe actualizar campos mutables de la agenda exitosamente', async () => {
      const agendaMock = { id: 'agenda-1', fechaHoraInicio: new Date(), estaReservado: false };
      mockAgendaRepository.findOne.mockResolvedValue(agendaMock);
      mockAgendaRepository.save.mockResolvedValue({ ...agendaMock, estaReservado: true });

      const res = await service.actualizarDisponibilidad('agenda-1', 'psico-1', new Date(), true);
      expect(mockAgendaRepository.save).toHaveBeenCalled();
      expect(res.estaReservado).toBe(true);
    });
  });

  describe('eliminarDisponibilidad', () => {
    it('debe lanzar NotFoundException si el bloque de agenda no existe', async () => {
      mockAgendaRepository.findOne.mockResolvedValue(null);

      await expect(
        service.eliminarDisponibilidad('agenda-invalida', 'psico-123'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debe invocar remove si el bloque de agenda es válido', async () => {
      const agendaMock = { id: 'agenda-1' };
      mockAgendaRepository.findOne.mockResolvedValue(agendaMock);
      mockAgendaRepository.remove.mockResolvedValue(undefined);

      await service.eliminarDisponibilidad('agenda-1', 'psico-123');

      expect(mockAgendaRepository.remove).toHaveBeenCalledWith(agendaMock);
    });
  });

  describe('Gestión de Horarios de Trabajo Base', () => {
    it('listarTodosLosHorariosTrabajo() debe retornar los horarios ordenados', async () => {
      mockHorarioRepository.find.mockResolvedValue([]);
      const res = await service.listarTodosLosHorariosTrabajo();
      expect(mockHorarioRepository.find).toHaveBeenCalled();
      expect(res).toEqual([]);
    });

    it('guardarHorarioTrabajo() debe estructurar y almacenar el nuevo horario base', async () => {
      const horarioMock = { id: 'h-1', diaSemana: 1, horaApertura: '08:00', horaCierre: '17:00' };
      mockHorarioRepository.create.mockReturnValue(horarioMock);
      mockHorarioRepository.save.mockResolvedValue(horarioMock);

      const res = await service.guardarHorarioTrabajo('psico-1', 1, '08:00', '17:00');

      expect(mockHorarioRepository.create).toHaveBeenCalled();
      expect(res).toEqual(horarioMock);
    });

    it('buscarHorarioTrabajoPorId() debe mapear el registro', async () => {
      const mockH = { id: 'h-1' };
      mockHorarioRepository.findOne.mockResolvedValue(mockH);
      const res = await service.buscarHorarioTrabajoPorId('h-1');
      expect(res).toEqual(mockH);
    });

    it('actualizarHorarioTrabajo() debe lanzar NotFoundException si no existe el registro', async () => {
      mockHorarioRepository.findOne.mockResolvedValue(null);
      await expect(service.actualizarHorarioTrabajo('h-falso', 'psico-1', 2)).rejects.toThrow(NotFoundException);
    });

    it('actualizarHorarioTrabajo() debe lanzar ForbiddenException si el psicologo no coincide', async () => {
      const mockH = { id: 'h-1', psicologo: { id: 'psico-real' } };
      mockHorarioRepository.findOne.mockResolvedValue(mockH);

      await expect(
        service.actualizarHorarioTrabajo('h-1', 'psico-impostor', 3, '09:00', '18:00')
      ).rejects.toThrow(ForbiddenException);
    });

    it('actualizarHorarioTrabajo() debe modificar todos los parámetros opcionales', async () => {
      const mockH = { id: 'h-1', diaSemana: 1, horaApertura: '08:00', horaCierre: '17:00', psicologo: { id: 'psico-1' } };
      mockHorarioRepository.findOne.mockResolvedValue(mockH);
      mockHorarioRepository.save.mockResolvedValue(mockH);

      const res = await service.actualizarHorarioTrabajo('h-1', 'psico-1', 2, '09:00', '16:00');
      expect(res.diaSemana).toBe(2);
    });

    it('eliminarHorarioTrabajo() debe lanzar errores correspondientes o remover', async () => {
      mockHorarioRepository.findOne.mockResolvedValue(null);
      await expect(service.eliminarHorarioTrabajo('h-falso', 'p-1')).rejects.toThrow(NotFoundException);

      const mockH = { id: 'h-1', psicologo: { id: 'p-1' } };
      mockHorarioRepository.findOne.mockResolvedValue(mockH);
      await service.eliminarHorarioTrabajo('h-1', 'p-1');
      expect(mockHorarioRepository.remove).toHaveBeenCalledWith(mockH);
    });
  });

  describe('Gestión de Excepciones de Disponibilidad', () => {
    it('listarTodasLasExcepciones() debe retornar el listado completo descendente', async () => {
      mockExcepcionRepository.find.mockResolvedValue([]);
      const res = await service.listarTodasLasExcepciones();
      expect(mockExcepcionRepository.find).toHaveBeenCalled();
      expect(res).toEqual([]);
    });

    it('guardarExcepcion() debe instanciar y guardar la excepción del psicólogo', async () => {
      const excMock = { id: 'e-1', motivo: 'Congreso' };
      mockExcepcionRepository.create.mockReturnValue(excMock);
      mockExcepcionRepository.save.mockResolvedValue(excMock);

      const res = await service.guardarExcepcion('psico-1', new Date(), new Date(), 'Congreso');

      expect(mockExcepcionRepository.create).toHaveBeenCalled();
      expect(res).toEqual(excMock);
    });

    it('buscarExcepcionPorId() debe retornar el registro o null si no se encuentra', async () => {
      mockExcepcionRepository.findOne.mockResolvedValue(null);
      const res = await service.buscarExcepcionPorId('e-falsa');
      expect(res).toBeNull();
    });

    it('actualizarExcepcion() debe lanzar excepciones o guardar cambios correctamente', async () => {
      mockExcepcionRepository.findOne.mockResolvedValue(null);
      await expect(service.actualizarExcepcion('ex-falsa', 'p-1')).rejects.toThrow(NotFoundException);

      const mockEx = { id: 'e-1', motivo: 'X', psicologo: { id: 'p-real' } };
      mockExcepcionRepository.findOne.mockResolvedValue(mockEx);
      await expect(service.actualizarExcepcion('e-1', 'p-falso', new Date(), new Date(), 'W')).rejects.toThrow(ForbiddenException);

      mockExcepcionRepository.findOne.mockResolvedValue(mockEx);
      mockExcepcionRepository.save.mockResolvedValue(mockEx);
      const res = await service.actualizarExcepcion('e-1', 'p-real', new Date(), new Date(), 'Nuevo Motivo');
      expect(res.motivo).toBe('Nuevo Motivo');
    });

    it('eliminarExcepcion() debe procesar remociones de manera segura', async () => {
      mockExcepcionRepository.findOne.mockResolvedValue(null);
      await expect(service.eliminarExcepcion('e-falsa', 'p-1')).rejects.toThrow(NotFoundException);

      const mockEx = { id: 'e-1', psicologo: { id: 'p-1' } };
      mockExcepcionRepository.findOne.mockResolvedValue(mockEx);
      await service.eliminarExcepcion('e-1', 'p-1');
      expect(mockExcepcionRepository.remove).toHaveBeenCalledWith(mockEx);
    });
  });
});