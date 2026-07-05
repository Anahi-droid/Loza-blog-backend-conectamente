import { Test, TestingModule } from '@nestjs/testing';
import { PsicologosController } from './psicologos.controller';
import { PsicologosService } from './psicologos.service';
import { Psicologo } from './psicologo.entity';

describe('PsicologosController', () => {
  let controller: PsicologosController;

  const mockPsicologosService = {
    listarTodos: jest.fn(),
    crearPerfil: jest.fn(),
    actualizar: jest.fn(),
    eliminar: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PsicologosController],
      providers: [
        { provide: PsicologosService, useValue: mockPsicologosService },
      ],
    }).compile();

    controller = module.get<PsicologosController>(PsicologosController);
    jest.clearAllMocks();
  });

  it('debe estar definido e inicializar sus dependencias (Ramas Constructor)', () => {
    expect(controller).toBeDefined();
  });

  describe('listarTodos', () => {
    it('debe invocar a psicologosService.listarTodos y retornar la lista de psicólogos', async () => {
      const listaMock = [{ id: 'psico-1', numeroColegiatura: '123' }] as Psicologo[];
      mockPsicologosService.listarTodos.mockResolvedValue(listaMock);

      const resultado = await controller.listarTodos();

      expect(mockPsicologosService.listarTodos).toHaveBeenCalled();
      expect(resultado).toEqual(listaMock);
    });
  });

  describe('crearPerfil', () => {
    it('debe invocar a psicologosService.crearPerfil y retornar el perfil creado', async () => {
      const datosProf: Partial<Psicologo> = { numeroColegiatura: '123' };
      const resultadoMock = { id: 'psico-1', ...datosProf } as Psicologo;
      mockPsicologosService.crearPerfil.mockResolvedValue(resultadoMock);

      const resultado = await controller.crearPerfil('user-123', datosProf);

      expect(mockPsicologosService.crearPerfil).toHaveBeenCalledWith('user-123', datosProf);
      expect(resultado).toEqual(resultadoMock);
    });
  });

  describe('actualizar', () => {
    it('debe invocar a psicologosService.actualizar y retornar el perfil modificado', async () => {
      const camposActualizar: Partial<Psicologo> = { numeroColegiatura: '999' };
      const resultadoMock = { id: 'psico-1', numeroColegiatura: '999' } as Psicologo;
      mockPsicologosService.actualizar.mockResolvedValue(resultadoMock);

      const resultado = await controller.actualizar('psico-1', camposActualizar);

      expect(mockPsicologosService.actualizar).toHaveBeenCalledWith('psico-1', camposActualizar);
      expect(resultado).toEqual(resultadoMock);
    });
  });

  describe('eliminar', () => {
    it('debe invocar a psicologosService.eliminar y retornar el mensaje de éxito estructurado', async () => {
      mockPsicologosService.eliminar.mockResolvedValue(undefined);

      const resultado = await controller.eliminar('psico-1');

      expect(mockPsicologosService.eliminar).toHaveBeenCalledWith('psico-1');
      expect(resultado).toEqual({ message: 'Perfil profesional con ID psico-1 eliminado con éxito.' });
    });
  });
});