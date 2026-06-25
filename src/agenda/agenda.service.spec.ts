import { Test, TestingModule } from '@nestjs/testing';
import { AgendasService } from './agenda.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Agenda } from './agenda.entity';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';

describe('AgendasService', () => {
  let service: AgendasService;
  let repository: Repository<Agenda>;

  const mockAgendaRepository = {
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AgendasService,
        {
          provide: getRepositoryToken(Agenda),
          useValue: mockAgendaRepository,
        },
      ],
    }).compile();

    service = module.get<AgendasService>(AgendasService);
    repository = module.get<Repository<Agenda>>(getRepositoryToken(Agenda));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('debe estar definido el servicio', () => {
    expect(service).toBeDefined();
  });

  describe('crearDisponibilidad', () => {
    it('debe lanzar ConflictException si el horario ya existe', async () => {
      const fecha = new Date();
      mockAgendaRepository.findOne.mockResolvedValue(new Agenda());

      await expect(service.crearDisponibilidad('psico-123', fecha)).rejects.toThrow(
        ConflictException,
      );
    });

    it('debe crear y retornar un bloque de agenda si no existe duplicado', async () => {
      const fecha = new Date();
      const mockBloque = { id: 'agenda-uuid', fechaHoraInicio: fecha, estaReservado: false };
      
      mockAgendaRepository.findOne.mockResolvedValue(null);
      mockAgendaRepository.create.mockReturnValue(mockBloque);
      mockAgendaRepository.save.mockResolvedValue(mockBloque);

      const resultado = await service.crearDisponibilidad('psico-123', fecha);
      expect(resultado).toEqual(mockBloque);
      expect(mockAgendaRepository.save).toHaveBeenCalledTimes(1);
    });
  });
});