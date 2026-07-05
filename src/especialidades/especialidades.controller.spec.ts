import { Test, TestingModule } from '@nestjs/testing';
import { EspecialidadesController } from './especialidades.controller';
import { EspecialidadesService } from './especialidades.service';

const ESPECIALIDAD_ID = '22222222-2222-2222-2222-222222222222';

describe('EspecialidadesController', () => {
  let controller: EspecialidadesController;
  let service: EspecialidadesService;

  const mockEspecialidadesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [EspecialidadesController],
      providers: [
        {
          provide: EspecialidadesService,
          useValue: mockEspecialidadesService,
        },
      ],
    }).compile();

    controller = module.get<EspecialidadesController>(EspecialidadesController);
    service = module.get<EspecialidadesService>(EspecialidadesService);
  });

  it('debería estar definido el controlador', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('debería invocar a service.create con el DTO correcto', async () => {
      const dto = { nombre: 'Terapia de Pareja', descripcion: 'Enfoque sistémico' };
      mockEspecialidadesService.create.mockResolvedValue({ id: ESPECIALIDAD_ID, ...dto });

      const result = await controller.create(dto);

      expect(result.id).toEqual(ESPECIALIDAD_ID);
      expect(service.create).toHaveBeenCalledWith(dto);
      expect(service.create).toHaveBeenCalledTimes(1);
    });
  });

  describe('findAll', () => {
    it('debería invocar a service.findAll y retornar todas las especialidades', async () => {
      const mockResult = [{ id: ESPECIALIDAD_ID, nombre: 'Terapia Cognitivo Conductual' }];
      mockEspecialidadesService.findAll.mockResolvedValue(mockResult);

      const result = await controller.findAll();

      expect(result).toEqual(mockResult);
      expect(service.findAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('findOne', () => {
    it('debería invocar a service.findOne con el parámetro ID', async () => {
      const mockEspecialidad = { id: ESPECIALIDAD_ID, nombre: 'Psicoanálisis' };
      mockEspecialidadesService.findOne.mockResolvedValue(mockEspecialidad);

      const result = await controller.findOne(ESPECIALIDAD_ID);

      expect(result).toEqual(mockEspecialidad);
      expect(service.findOne).toHaveBeenCalledWith(ESPECIALIDAD_ID);
    });
  });

  describe('update', () => {
    it('debería invocar a service.update enviando el ID y las propiedades a cambiar', async () => {
      const dto = { nombre: 'Gestalt' };
      const mockEditado = { id: ESPECIALIDAD_ID, ...dto };
      mockEspecialidadesService.update.mockResolvedValue(mockEditado);

      const result = await controller.update(ESPECIALIDAD_ID, dto);

      expect(result).toEqual(mockEditado);
      expect(service.update).toHaveBeenCalledWith(ESPECIALIDAD_ID, dto);
    });
  });

  describe('remove', () => {
    it('debería invocar a service.remove y regresar la confirmación', async () => {
      const mockResponse = { message: `Especialidad con ID ${ESPECIALIDAD_ID} eliminada exitosamente` };
      mockEspecialidadesService.remove.mockResolvedValue(mockResponse);

      const result = await controller.remove(ESPECIALIDAD_ID);

      expect(result).toEqual(mockResponse);
      expect(service.remove).toHaveBeenCalledWith(ESPECIALIDAD_ID);
    });
  });
});