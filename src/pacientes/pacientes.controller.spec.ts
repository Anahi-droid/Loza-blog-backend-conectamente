import { Test, TestingModule } from '@nestjs/testing';
import { PacientesController } from './pacientes.controller';
import { PacientesService } from './pacientes.service';

const PACIENTE_ID = '11111111-1111-1111-1111-111111111111';

describe('PacientesController', () => {
  let controller: PacientesController;
  let service: PacientesService;

  const mockPacientesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PacientesController],
      providers: [
        {
          provide: PacientesService,
          useValue: mockPacientesService,
        },
      ],
    }).compile();

    controller = module.get<PacientesController>(PacientesController);
    service = module.get<PacientesService>(PacientesService);
  });

  it('debería estar definido el controlador', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería invocar a service.create y retornar el resultado', async () => {
      const dto = { usuarioId: 'user-uuid', fechaNacimiento: '1995-12-12' };
      mockPacientesService.create.mockResolvedValue({ id: PACIENTE_ID, ...dto });

      const result = await controller.create(dto);

      expect(result.id).toEqual(PACIENTE_ID);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('debería invocar a service.findAll y retornar una lista', async () => {
      const mockResult = [{ id: 'user-1', rol: 'PACIENTE' }];
      mockPacientesService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll();

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('debería invocar a service.findOne con el ID correspondiente', async () => {
      const mockPaciente = { id: PACIENTE_ID, genero: 'Masc' };
      mockPacientesService.findOne.mockResolvedValue(mockPaciente);

      const result = await controller.findOne(PACIENTE_ID);

      expect(result).toEqual(mockPaciente);
      expect(service.findOne).toHaveBeenCalledWith(PACIENTE_ID);
    });
  });

  describe('update', () => {
    it('debería invocar a service.update pasándole el ID y los datos', async () => {
      const dto = { ocupacion: 'Estudiante' };
      const mockPacienteActualizado = { id: PACIENTE_ID, ...dto };
      mockPacientesService.update.mockResolvedValue(mockPacienteActualizado);

      const result = await controller.update(PACIENTE_ID, dto);

      expect(result).toEqual(mockPacienteActualizado);
      expect(service.update).toHaveBeenCalledWith(PACIENTE_ID, dto);
    });
  });

  describe('remove', () => {
    it('debería invocar a service.remove y confirmar el borrado', async () => {
      mockPacientesService.remove.mockResolvedValue({ deleted: true });

      const result = await controller.remove(PACIENTE_ID);

      expect(result).toEqual({ deleted: true });
      expect(service.remove).toHaveBeenCalledWith(PACIENTE_ID);
    });
  });
});