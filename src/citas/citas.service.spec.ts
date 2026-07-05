import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';

import { CitasService } from './citas.service';
import { Cita } from './cita.entity';
import { Agenda } from '../agenda/agenda.entity';
import { Pago } from './pago.entity';
import { SesionClinica } from './sesion-clinica.entity';

describe('CitasService', () => {
  let service: CitasService;

  const mockCitaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
  };

  const mockAgendaRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockPagoRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  const mockSesionRepository = {
    create: jest.fn(),
    save: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitasService,
        {
          provide: getRepositoryToken(Cita),
          useValue: mockCitaRepository,
        },
        {
          provide: getRepositoryToken(Agenda),
          useValue: mockAgendaRepository,
        },
        {
          provide: getRepositoryToken(Pago),
          useValue: mockPagoRepository,
        },
        {
          provide: getRepositoryToken(SesionClinica),
          useValue: mockSesionRepository,
        },
      ],
    }).compile();

    service = module.get<CitasService>(CitasService);
  });

  it('debería estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('agendarCita', () => {
    it('debería crear correctamente una cita', async () => {
      const agenda = {
        id: 'agenda',
        estaReservado: false,
        fechaHoraInicio: new Date(),
        psicologo: { id: 'psi' },
      };

      mockAgendaRepository.findOne.mockResolvedValue(agenda);
      mockAgendaRepository.save.mockResolvedValue(agenda);

      const cita = { id: 'cita' };

      mockCitaRepository.create.mockReturnValue(cita);
      mockCitaRepository.save.mockResolvedValue(cita);

      mockPagoRepository.create.mockReturnValue({});
      mockPagoRepository.save.mockResolvedValue({});

      mockSesionRepository.create.mockReturnValue({});
      mockSesionRepository.save.mockResolvedValue({});

      const result = await service.agendarCita(
        'paciente',
        'agenda',
        'Motivo',
      );

      expect(result).toEqual(cita);
      expect(mockAgendaRepository.save).toHaveBeenCalled();
      expect(mockCitaRepository.save).toHaveBeenCalled();
      expect(mockPagoRepository.save).toHaveBeenCalled();
      expect(mockSesionRepository.save).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException cuando no exista la agenda', async () => {
      mockAgendaRepository.findOne.mockResolvedValue(null);

      await expect(
        service.agendarCita('1', '2', 'Motivo'),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar BadRequestException cuando la agenda esté reservada', async () => {
      mockAgendaRepository.findOne.mockResolvedValue({
        estaReservado: true,
      });

      await expect(
        service.agendarCita('1', '2', 'Motivo'),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('listarMisCitas', () => {
    it('debería listar las citas', async () => {
      mockCitaRepository.find.mockResolvedValue([{ id: '1' }]);

      const result = await service.listarMisCitas(
        'usuario',
        'PACIENTE',
      );

      expect(result).toEqual([{ id: '1' }]);
      expect(mockCitaRepository.find).toHaveBeenCalled();
    });
  });

  describe('obtenerCitaPorId', () => {
    it('debería obtener una cita', async () => {
      const cita = {
        id: '1',
        paciente: {
          id: 'usuario',
        },
      };

      mockCitaRepository.findOne.mockResolvedValue(cita);

      const result = await service.obtenerCitaPorId(
        '1',
        'usuario',
        'PACIENTE',
      );

      expect(result).toEqual(cita);
    });

    it('debería lanzar NotFoundException', async () => {
      mockCitaRepository.findOne.mockResolvedValue(null);

      await expect(
        service.obtenerCitaPorId(
          '1',
          'usuario',
          'PACIENTE',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException', async () => {
      mockCitaRepository.findOne.mockResolvedValue({
        paciente: {
          id: 'otro',
        },
      });

      await expect(
        service.obtenerCitaPorId(
          '1',
          'usuario',
          'PACIENTE',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('actualizarCita', () => {
    it('debería actualizar una cita', async () => {
      const cita = {
        id: '1',
        paciente: {
          id: 'usuario',
        },
        estado: 'PENDIENTE',
      };

      mockCitaRepository.findOne.mockResolvedValue(cita);
      mockCitaRepository.save.mockResolvedValue({
        ...cita,
        estado: 'REALIZADA',
      });

      const result = await service.actualizarCita(
        '1',
        'usuario',
        'PACIENTE',
        'REALIZADA',
        'Notas',
      );

      expect(result.estado).toEqual('REALIZADA');
      expect(mockCitaRepository.save).toHaveBeenCalled();
    });
  });

  describe('eliminarCita', () => {
    it('debería eliminar una cita', async () => {
      const cita = {
        id: '1',
        fechaHora: new Date(),
        paciente: {
          id: 'usuario',
        },
        psicologo: {
          id: 'psicologo',
        },
      };

      mockCitaRepository.findOne.mockResolvedValue(cita);

      mockAgendaRepository.findOne.mockResolvedValue({
        estaReservado: true,
      });

      mockAgendaRepository.save.mockResolvedValue({});
      mockCitaRepository.remove.mockResolvedValue({});

      await service.eliminarCita(
        '1',
        'usuario',
        'PACIENTE',
      );

      expect(mockCitaRepository.remove).toHaveBeenCalled();
    });

    it('debería lanzar NotFoundException si la cita no existe', async () => {
      mockCitaRepository.findOne.mockResolvedValue(null);

      await expect(
        service.eliminarCita(
          '1',
          'usuario',
          'PACIENTE',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('debería lanzar ForbiddenException', async () => {
      mockCitaRepository.findOne.mockResolvedValue({
        paciente: {
          id: 'otro',
        },
      });

      await expect(
        service.eliminarCita(
          '1',
          'usuario',
          'PACIENTE',
        ),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});