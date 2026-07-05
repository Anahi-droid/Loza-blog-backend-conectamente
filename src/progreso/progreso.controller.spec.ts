import { Test, TestingModule } from '@nestjs/testing';
import { ProgresoController } from './progreso.controller';
import { ProgresoService } from './progreso.service';

const PROGRESO_ID = '11111111-1111-1111-1111-111111111111';
const HISTORIAL_ID = '22222222-2222-2222-2222-222222222222';

describe('ProgresoController', () => {
  let controller: ProgresoController;
  let service: ProgresoService;

  const mockProgresoService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByPaciente: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProgresoController],
      providers: [
        {
          provide: ProgresoService,
          useValue: mockProgresoService,
        },
      ],
    }).compile();

    controller = module.get<ProgresoController>(ProgresoController);
    service = module.get<ProgresoService>(ProgresoService);
  });

  it('debería estar definido el controlador', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería invocar a service.create', async () => {
      const dto = {
        historialId: HISTORIAL_ID,
        fecha: new Date(),
        estadoEmocional: 'Ansioso',
        avance: 'Presenta mejoría',
      };

      const mockResult = { id: PROGRESO_ID, ...dto };

      mockProgresoService.create.mockResolvedValue(mockResult);

      const result = await controller.create(dto);

      expect(result).toEqual(mockResult);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('debería retornar todos los progresos', async () => {
      const lista = [{ id: PROGRESO_ID }];

      mockProgresoService.findAll.mockResolvedValue(lista);

      const result = await controller.findAll();

      expect(result).toEqual(lista);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('debería buscar un progreso por id', async () => {
      const progreso = { id: PROGRESO_ID };

      mockProgresoService.findOne.mockResolvedValue(progreso);

      const result = await controller.findOne(PROGRESO_ID);

      expect(result).toEqual(progreso);
      expect(service.findOne).toHaveBeenCalledWith(PROGRESO_ID);
    });
  });

  describe('findByPaciente', () => {
    it('debería listar progresos del paciente', async () => {
      const lista = [{ id: PROGRESO_ID }];

      mockProgresoService.findByPaciente.mockResolvedValue(lista);

      const result = await controller.findByPaciente(HISTORIAL_ID);

      expect(result).toEqual(lista);
      expect(service.findByPaciente).toHaveBeenCalledWith(HISTORIAL_ID);
    });
  });

  describe('update', () => {
    it('debería actualizar un progreso', async () => {
      const dto = {
        observaciones: 'Paciente estable',
      };

      const actualizado = {
        id: PROGRESO_ID,
        ...dto,
      };

      mockProgresoService.update.mockResolvedValue(actualizado);

      const result = await controller.update(PROGRESO_ID, dto);

      expect(result).toEqual(actualizado);
      expect(service.update).toHaveBeenCalledWith(PROGRESO_ID, dto);
    });
  });

  describe('remove', () => {
    it('debería eliminar un progreso', async () => {
      const respuesta = {
        message: `Progreso con ID ${PROGRESO_ID} eliminado exitosamente`,
      };

      mockProgresoService.remove.mockResolvedValue(respuesta);

      const result = await controller.remove(PROGRESO_ID);

      expect(result).toEqual(respuesta);
      expect(service.remove).toHaveBeenCalledWith(PROGRESO_ID);
    });
  });
});