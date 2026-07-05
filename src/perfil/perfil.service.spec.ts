import { Test, TestingModule } from '@nestjs/testing';
import { PerfilService } from './perfil.service';
import { UsuariosService } from '../usuarios/usuarios.service';

const USUARIO_ID = '33333333-3333-3333-3333-333333333333';

describe('PerfilService', () => {
  let service: PerfilService;
  let usuariosService: UsuariosService;

  const mockUsuariosService = {
    buscarPorId: jest.fn(),
    crear: jest.fn(),
    actualizar: jest.fn(),
    desactivar: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilService,
        {
          provide: UsuariosService,
          useValue: mockUsuariosService,
        },
      ],
    }).compile();

    service = module.get<PerfilService>(PerfilService);
    usuariosService = module.get<UsuariosService>(UsuariosService);
  });

  it('debería estar definido el servicio de perfil', () => {
    expect(service).toBeDefined();
  });

  describe('obtenerPerfil', () => {
    it('debería retornar el perfil del usuario omitiendo la contraseña', async () => {
      const mockUsuarioCompleto = {
        id: USUARIO_ID,
        nombre: 'Carlos',
        apellido: 'Pérez',
        email: 'carlos@example.com',
        password: 'password_encriptada_123',
      };

      mockUsuariosService.buscarPorId.mockResolvedValue(mockUsuarioCompleto);

      const result = await service.obtenerPerfil(USUARIO_ID);

      // Verificamos que el campo password no se encuentre en el objeto resultante
      expect(result.password).toBeUndefined();
      expect(result.nombre).toEqual('Carlos');
      expect(mockUsuariosService.buscarPorId).toHaveBeenCalledWith(USUARIO_ID);
      expect(mockUsuariosService.buscarPorId).toHaveBeenCalledTimes(1);
    });
  });

  describe('crearPerfil', () => {
    it('debería registrar un usuario y retornar su perfil sin password', async () => {
      const dto = { nombre: 'Ana', apellido: 'Gómez', email: 'ana@example.com', password: 'secret123' };
      const mockUsuarioCreado = { id: USUARIO_ID, ...dto, password: 'hashed_password' };

      mockUsuariosService.crear.mockResolvedValue(mockUsuarioCreado);

      const result = await service.crearPerfil(dto);

      expect(result.password).toBeUndefined();
      expect(result.email).toEqual('ana@example.com');
      expect(mockUsuariosService.crear).toHaveBeenCalledWith(dto);
    });
  });

  describe('actualizarPerfil', () => {
    it('debería modificar los campos del perfil y retornar la versión actualizada sin password', async () => {
      const dto = { nombre: 'Carlos Modificado' };
      const mockUsuarioActualizado = {
        id: USUARIO_ID,
        nombre: 'Carlos Modificado',
        apellido: 'Pérez',
        email: 'carlos@example.com',
        password: 'hashed_password',
      };

      mockUsuariosService.actualizar.mockResolvedValue(mockUsuarioActualizado);

      const result = await service.actualizarPerfil(USUARIO_ID, dto);

      expect(result.password).toBeUndefined();
      expect(result.nombre).toEqual('Carlos Modificado');
      expect(mockUsuariosService.actualizar).toHaveBeenCalledWith(USUARIO_ID, dto);
    });
  });

  describe('eliminarPerfil', () => {
    it('debería invocar la desactivación de la cuenta del usuario correctamente', async () => {
      mockUsuariosService.desactivar.mockResolvedValue(undefined);

      await service.eliminarPerfil(USUARIO_ID);

      expect(mockUsuariosService.desactivar).toHaveBeenCalledWith(USUARIO_ID);
      expect(mockUsuariosService.desactivar).toHaveBeenCalledTimes(1);
    });
  });
});