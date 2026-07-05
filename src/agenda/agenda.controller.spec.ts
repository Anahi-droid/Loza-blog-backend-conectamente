import { Test, TestingModule } from '@nestjs/testing';
import { AgendasController } from './agenda.controller';
import { AgendasService } from './agenda.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';

describe('AgendasController', () => {
  let controller: AgendasController;

  const mockAgendasService = {
    listarTodosLosHorariosTrabajo: jest.fn(),
    listarTodasLasExcepciones: jest.fn(),
    listarTodasLasAgendas: jest.fn(),
    crearDisponibilidad: jest.fn(),
    obtenerDisponiblesPorPsicologo: jest.fn(),
    buscarPorId: jest.fn(),
    actualizarDisponibilidad: jest.fn(),
    eliminarDisponibilidad: jest.fn(),
    buscarHorarioTrabajoPorId: jest.fn(),
    guardarHorarioTrabajo: jest.fn(),
    actualizarHorarioTrabajo: jest.fn(),
    eliminarHorarioTrabajo: jest.fn(),
    buscarExcepcionPorId: jest.fn(),
    guardarExcepcion: jest.fn(),
    actualizarExcepcion: jest.fn(),
    eliminarExcepcion: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgendasController],
      providers: [{ provide: AgendasService, useValue: mockAgendasService }],
    }).compile();

    controller = module.get<AgendasController>(AgendasController);
    jest.clearAllMocks();
  });

  describe('Consultas Globales', () => {
    it('obtenerTodosLosHorariosTrabajo() debe retornar el listado de horarios del servicio', async () => {
      mockAgendasService.listarTodosLosHorariosTrabajo.mockResolvedValue([]);
      const res = await controller.obtenerTodosLosHorariosTrabajo();
      expect(res).toEqual([]);
    });

    it('obtenerTodasLasExcepciones() debe retornar el listado de excepciones del servicio', async () => {
      mockAgendasService.listarTodasLasExcepciones.mockResolvedValue([]);
      const res = await controller.obtenerTodasLasExcepciones();
      expect(res).toEqual([]);
    });

    it('obtenerTodas() debe listar todas las agendas de forma global', async () => {
      mockAgendasService.listarTodasLasAgendas.mockResolvedValue([]);
      const res = await controller.obtenerTodas();
      expect(res).toEqual([]);
    });
  });

  describe('Gestión de Disponibilidad Básica (Crear, Actualizar, Eliminar)', () => {
    it('crearHorario() debe lanzar BadRequestException si el token no tiene id ni psicologoId', async () => {
      const req = { user: {} };
      await expect(controller.crearHorario(req, '2026-07-02T20:00:00.000Z')).rejects.toThrow(BadRequestException);
    });

    it('crearHorario() debe mapear el id del psicologo usando req.user si es válido', async () => {
      const req = { user: { id: 'psico-123' } };
      mockAgendasService.crearDisponibilidad.mockResolvedValue({ id: 'agenda-1' });
      const res = await controller.crearHorario(req, '2026-07-02T20:00:00.000Z');
      expect(res).toEqual({ id: 'agenda-1' });
    });

    it('obtenerDisponibles() debe lanzar BadRequestException si el ID es indefinido o string "undefined"', async () => {
      await expect(async () => controller.obtenerDisponibles('')).rejects.toThrow(BadRequestException);
      await expect(async () => controller.obtenerDisponibles('undefined')).rejects.toThrow(BadRequestException);
    });

    it('obtenerDisponibles() debe retornar las agendas libres del psicólogo', async () => {
      mockAgendasService.obtenerDisponiblesPorPsicologo.mockResolvedValue([]);
      const res = await controller.obtenerDisponibles('psico-1');
      expect(res).toEqual([]);
    });

    it('obtenerPorId() debe lanzar NotFoundException si el bloque de agenda no existe', async () => {
      mockAgendasService.buscarPorId.mockResolvedValue(null);
      await expect(controller.obtenerPorId('uuid-falso')).rejects.toThrow(NotFoundException);
    });

    it('obtenerPorId() debe retornar la agenda si es encontrada por ID', async () => {
      const agendaMock = { id: 'uuid-123', estaReservado: false };
      mockAgendasService.buscarPorId.mockResolvedValue(agendaMock);
      const res = await controller.obtenerPorId('uuid-123');
      expect(res).toEqual(agendaMock);
    });

    it('actualizarHorario() debe invocar la modificación del bloque con parámetros opcionales', async () => {
      const req = { user: { psicologoId: 'psico-1' } };
      mockAgendasService.actualizarDisponibilidad.mockResolvedValue({ id: 'agenda-1' });
      const res = await controller.actualizarHorario('agenda-1', req, '2026-07-02T21:00:00.000Z', true);
      expect(res).toEqual({ id: 'agenda-1' });
    });

    it('eliminarHorario() debe eliminar la disponibilidad y retornar mensaje de éxito', async () => {
      const req = { user: { id: 'psico-1' } };
      mockAgendasService.eliminarDisponibilidad.mockResolvedValue(undefined);
      const res = await controller.eliminarHorario('agenda-1', req);
      expect(mockAgendasService.eliminarDisponibilidad).toHaveBeenCalledWith('agenda-1', 'psico-1');
      expect(res).toEqual({ message: 'Bloque de disponibilidad eliminado correctamente.' });
    });
  });

  describe('Gestión de Horarios de Trabajo Base', () => {
    it('obtenerHorarioTrabajoPorId() debe retornar el registro o lanzar NotFoundException', async () => {
      mockAgendasService.buscarHorarioTrabajoPorId.mockResolvedValue(null);
      await expect(controller.obtenerHorarioTrabajoPorId('h-falso')).rejects.toThrow(NotFoundException);

      const mockH = { id: 'h-1' };
      mockAgendasService.buscarHorarioTrabajoPorId.mockResolvedValue(mockH);
      const res = await controller.obtenerHorarioTrabajoPorId('h-1');
      expect(res).toEqual(mockH);
    });

    it('registrarHorarioTrabajo() debe guardar un nuevo horario base', async () => {
      const req = { user: { id: 'p-1' } };
      mockAgendasService.guardarHorarioTrabajo.mockResolvedValue({ id: 'h-1' });
      const res = await controller.registrarHorarioTrabajo(req, 1, '08:00', '16:00');
      expect(res).toEqual({ id: 'h-1' });
    });

    it('modificarHorarioTrabajo() debe actualizar campos del horario base', async () => {
      const req = { user: { id: 'p-1' } };
      mockAgendasService.actualizarHorarioTrabajo.mockResolvedValue({ id: 'h-1' });
      const res = await controller.modificarHorarioTrabajo('h-1', req, 2, '09:00', '17:00');
      expect(res).toEqual({ id: 'h-1' });
    });

    it('removerHorarioTrabajo() debe procesar la eliminación física', async () => {
      const req = { user: { id: 'p-1' } };
      mockAgendasService.eliminarHorarioTrabajo.mockResolvedValue(undefined);
      const res = await controller.removerHorarioTrabajo('h-1', req);
      expect(res).toEqual({ message: 'Horario de trabajo base removido de forma exitosa.' });
    });
  });

  describe('Gestión de Excepciones de Disponibilidad', () => {
    it('obtenerExcepcionPorId() debe retornar la excepción o lanzar NotFoundException', async () => {
      mockAgendasService.buscarExcepcionPorId.mockResolvedValue(null);
      await expect(controller.obtenerExcepcionPorId('e-falsa')).rejects.toThrow(NotFoundException);

      const mockE = { id: 'e-1' };
      mockAgendasService.buscarExcepcionPorId.mockResolvedValue(mockE);
      const res = await controller.obtenerExcepcionPorId('e-1');
      expect(res).toEqual(mockE);
    });

    it('registrarExcepcion() debe guardar una nueva excepción', async () => {
      const req = { user: { id: 'p-1' } };
      mockAgendasService.guardarExcepcion.mockResolvedValue({ id: 'e-1' });
      const res = await controller.registrarExcepcion(req, '2026-07-02', '2026-07-03', 'Enfermedad');
      expect(res).toEqual({ id: 'e-1' });
    });

    it('modificarExcepcion() debe enviar cambios de manera controlada', async () => {
      const req = { user: { id: 'p-1' } };
      mockAgendasService.actualizarExcepcion.mockResolvedValue({ id: 'e-1' });
      const res = await controller.modificarExcepcion('e-1', req, '2026-07-02', undefined, 'Congreso');
      expect(res).toEqual({ id: 'e-1' });
    });

    it('removerExcepcion() debe invocar el borrado definitivo', async () => {
      const req = { user: { id: 'p-1' } };
      mockAgendasService.eliminarExcepcion.mockResolvedValue(undefined);
      const res = await controller.removerExcepcion('e-1', req);
      expect(res).toEqual({ message: 'Excepción de disponibilidad eliminada correctamente.' });
    });
  });
});