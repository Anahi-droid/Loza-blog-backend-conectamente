import { Test, TestingModule } from '@nestjs/testing';
import { CitasController } from './citas.controller';
import { CitasService } from './citas.service';

const CITA_ID = '11111111-1111-1111-1111-111111111111';
const USUARIO_ID = '22222222-2222-2222-2222-222222222222';

describe('CitasController', () => {
  let controller: CitasController;
  let service: CitasService;

  const mockCitasService = {
    agendarCita: jest.fn(),
    listarMisCitas: jest.fn(),
    obtenerCitaPorId: jest.fn(),
    actualizarCita: jest.fn(),
    eliminarCita: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CitasController],
      providers: [
        {
          provide: CitasService,
          useValue: mockCitasService,
        },
      ],
    }).compile();

    controller = module.get<CitasController>(CitasController);
    service = module.get<CitasService>(CitasService);
  });

  it('debería estar definido el controlador', () => {
    expect(controller).toBeDefined();
  });

  describe('reservarCita', () => {
    it('debería invocar a agendarCita', async () => {
      const req = {
        user: {
          id: USUARIO_ID,
        },
      };

      const dto = {
        agendaId: 'agenda-uuid',
        motivoConsulta: 'Ansiedad',
      };

      const mockResult = {
        id: CITA_ID,
        ...dto,
      };

      mockCitasService.agendarCita.mockResolvedValue(mockResult);

      const result = await controller.reservarCita(req, dto);

      expect(result).toEqual(mockResult);
      expect(service.agendarCita).toHaveBeenCalledWith(
        USUARIO_ID,
        dto.agendaId,
        dto.motivoConsulta,
      );
    });
  });

  describe('listarMisCitas', () => {
    it('debería invocar listarMisCitas', async () => {
      const req = {
        user: {
          id: USUARIO_ID,
          rol: 'PACIENTE',
        },
      };

      const mockLista = [{ id: CITA_ID }];

      mockCitasService.listarMisCitas.mockResolvedValue(mockLista);

      const result = await controller.listarMisCitas(req);

      expect(result).toEqual(mockLista);
      expect(service.listarMisCitas).toHaveBeenCalledWith(
        USUARIO_ID,
        'PACIENTE',
      );
    });
  });

  describe('obtenerPorId', () => {
    it('debería invocar obtenerCitaPorId', async () => {
      const req = {
        user: {
          id: USUARIO_ID,
          rol: 'PACIENTE',
        },
      };

      const cita = { id: CITA_ID };

      mockCitasService.obtenerCitaPorId.mockResolvedValue(cita);

      const result = await controller.obtenerPorId(CITA_ID, req);

      expect(result).toEqual(cita);

      expect(service.obtenerCitaPorId).toHaveBeenCalledWith(
        CITA_ID,
        USUARIO_ID,
        'PACIENTE',
      );
    });
  });

  describe('actualizarCita', () => {
    it('debería invocar actualizarCita', async () => {
      const req = {
        user: {
          id: USUARIO_ID,
          rol: 'PSICOLOGO',
        },
      };

      const actualizado = {
        id: CITA_ID,
        estado: 'REALIZADA',
      };

      mockCitasService.actualizarCita.mockResolvedValue(actualizado);

      const result = await controller.actualizarCita(
        CITA_ID,
        req,
        'REALIZADA',
        'Paciente estable',
      );

      expect(result).toEqual(actualizado);

      expect(service.actualizarCita).toHaveBeenCalledWith(
        CITA_ID,
        USUARIO_ID,
        'PSICOLOGO',
        'REALIZADA',
        'Paciente estable',
      );
    });
  });

  describe('eliminarCita', () => {
    it('debería invocar eliminarCita', async () => {
      const req = {
        user: {
          id: USUARIO_ID,
          rol: 'PACIENTE',
        },
      };

      mockCitasService.eliminarCita.mockResolvedValue(undefined);

      const result = await controller.eliminarCita(CITA_ID, req);

      expect(result).toEqual({
        message:
          'La cita ha sido cancelada y el horario de agenda se liberó con éxito.',
      });

      expect(service.eliminarCita).toHaveBeenCalledWith(
        CITA_ID,
        USUARIO_ID,
        'PACIENTE',
      );
    });
  });
});