import { Test, TestingModule } from '@nestjs/testing';
import { CitasService } from './citas.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Cita } from './cita.entity';
import { Agenda } from '../agenda/agenda.entity';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('CitasService', () => {
  let service: CitasService;

  const mockCitaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  const mockAgendaRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitasService,
        { provide: getRepositoryToken(Cita), useValue: mockCitaRepository },
        { provide: getRepositoryToken(Agenda), useValue: mockAgendaRepository },
      ],
    }).compile();

    service = module.get<CitasService>(CitasService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('agendarCita', () => {
    it('debe lanzar NotFoundException si la agenda no existe', async () => {
      mockAgendaRepository.findOne.mockResolvedValue(null);

      await expect(service.agendarCita('paciente-1', 'agenda-invalida', 'Motivo')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('debe lanzar BadRequestException si la agenda ya está reservada', async () => {
      mockAgendaRepository.findOne.mockResolvedValue({ id: 'agenda-1', estaReservado: true });

      await expect(service.agendarCita('paciente-1', 'agenda-1', 'Motivo')).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});