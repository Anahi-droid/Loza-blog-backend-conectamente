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
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AgendasController],
      providers: [{ provide: AgendasService, useValue: mockAgendasService }],
    }).compile();

    controller = module.get<AgendasController>(AgendasController);
    jest.clearAllMocks();
  });

  describe('obtenerTodas', () => {
    it('debe listar todas las agendas de forma global', async () => {
      mockAgendasService.listarTodasLasAgendas.mockResolvedValue([]);
      const res = await controller.obtenerTodas();
      expect(res).toEqual([]);
    });
  });

  describe('crearHorario', () => {
    it('debe lanzar BadRequestException si el token no tiene id', async () => {
      const req = { user: {} };
      await expect(controller.crearHorario(req, '2026-07-02T20:00:00.000Z')).rejects.toThrow(BadRequestException);
    });
  });

  describe('obtenerPorId', () => {
    it('debe lanzar NotFoundException si el bloque de agenda no existe', async () => {
      mockAgendasService.buscarPorId.mockResolvedValue(null);
      await expect(controller.obtenerPorId('uuid-falso')).rejects.toThrow(NotFoundException);
    });

    it('debe retornar la agenda si es encontrada por ID', async () => {
      const agendaMock = { id: 'uuid-123', estaReservado: false };
      mockAgendasService.buscarPorId.mockResolvedValue(agendaMock);
      const res = await controller.obtenerPorId('uuid-123');
      expect(res).toEqual(agendaMock);
    });
  });

  describe('eliminarHorario', () => {
    it('debe eliminar la disponibilidad y retornar mensaje de éxito', async () => {
      const req = { user: { id: 'psico-1' } };
      mockAgendasService.eliminarDisponibilidad.mockResolvedValue(undefined);
      
      const res = await controller.eliminarHorario('agenda-1', req);
      
      expect(mockAgendasService.eliminarDisponibilidad).toHaveBeenCalledWith('agenda-1', 'psico-1');
      expect(res).toEqual({ message: 'Bloque de disponibilidad eliminado correctamente.' });
    });
  });
});