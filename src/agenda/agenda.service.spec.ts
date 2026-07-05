import { Test, TestingModule } from '@nestjs/testing';
import { AgendasService } from './agenda.service';
import { Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Agenda } from './agenda.entity';
import { DisponibilidadExcepcion } from '../psicologos/disponibilidad-excepcion.entity';
import { HorarioTrabajo } from './horario-trabajo.entity';
import { BadRequestException, NotFoundException } from '@nestjs/common';

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

  describe('eliminarDisponibilidad', () => {
    it('debe lanzar NotFoundException si el bloque de agenda no existe o no coincide con el psicólogo', async () => {
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
});