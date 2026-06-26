import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { PerfilService } from './perfil.service';
import { UsuariosService } from '../usuarios/usuarios.service';

// ── Mocks ─────────────────────────────────────────────────────────────────

const mockUsuariosService = () => ({
  buscarPorId: jest.fn(),
  actualizar:  jest.fn(),
});

const usuarioCompleto = {
  id:            'uuid-perfil-001',
  email:         'carlos@clinica.com',
  password:      'hashed_pass_oculta',
  nombre:        'Carlos',
  apellido:      'Méndez',
  rol:           'PACIENTE',
  activo:        true,
  creadoEn:      new Date(),
  actualizadoEn: new Date(),
};

// ── Suite ─────────────────────────────────────────────────────────────────

describe('PerfilService', () => {
  let service: PerfilService;
  let usuariosService: ReturnType<typeof mockUsuariosService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PerfilService,
        { provide: UsuariosService, useFactory: mockUsuariosService },
      ],
    }).compile();

    service         = module.get<PerfilService>(PerfilService);
    usuariosService = module.get(UsuariosService);
  });

  // ── obtenerPerfil ─────────────────────────────────────────────────────────

  describe('obtenerPerfil', () => {
    it('debe retornar el perfil sin el campo password', async () => {
      usuariosService.buscarPorId.mockResolvedValue(usuarioCompleto);

      const resultado = await service.obtenerPerfil('uuid-perfil-001');

      expect(resultado).not.toHaveProperty('password');
      expect(resultado).toHaveProperty('email', 'carlos@clinica.com');
      expect(resultado).toHaveProperty('nombre', 'Carlos');
      expect(resultado).toHaveProperty('rol', 'PACIENTE');
    });

    it('debe consultar por el ID correcto proveniente del JWT', async () => {
      usuariosService.buscarPorId.mockResolvedValue(usuarioCompleto);

      await service.obtenerPerfil('uuid-perfil-001');

      expect(usuariosService.buscarPorId).toHaveBeenCalledWith('uuid-perfil-001');
      expect(usuariosService.buscarPorId).toHaveBeenCalledTimes(1);
    });

    it('debe propagar NotFoundException si el usuario no existe', async () => {
      usuariosService.buscarPorId.mockRejectedValue(
        new NotFoundException('Usuario no encontrado'),
      );

      await expect(service.obtenerPerfil('id-fantasma')).rejects.toThrow(NotFoundException);
    });
  });

  // ── actualizarPerfil ──────────────────────────────────────────────────────

  describe('actualizarPerfil', () => {
    const dto = { nombre: 'Carlos Alberto', apellido: 'Méndez Torres' };

    it('debe actualizar usando el ID del JWT, no uno externo', async () => {
      const actualizado = { ...usuarioCompleto, ...dto };
      usuariosService.actualizar.mockResolvedValue(actualizado);

      await service.actualizarPerfil('uuid-perfil-001', dto);

      expect(usuariosService.actualizar).toHaveBeenCalledWith('uuid-perfil-001', dto);
    });

    it('debe retornar el perfil actualizado sin password', async () => {
      const actualizado = { ...usuarioCompleto, ...dto };
      usuariosService.actualizar.mockResolvedValue(actualizado);

      const resultado = await service.actualizarPerfil('uuid-perfil-001', dto);

      expect(resultado).not.toHaveProperty('password');
      expect(resultado.nombre).toBe('Carlos Alberto');
    });

    it('debe permitir actualizar solo la contraseña', async () => {
      const dtoPassword = { password: 'NuevaClave789' };
      const actualizado = { ...usuarioCompleto };
      usuariosService.actualizar.mockResolvedValue(actualizado);

      await service.actualizarPerfil('uuid-perfil-001', dtoPassword);

      expect(usuariosService.actualizar).toHaveBeenCalledWith(
        'uuid-perfil-001',
        dtoPassword,
      );
    });

    it('debe propagar NotFoundException si el usuario no existe', async () => {
      usuariosService.actualizar.mockRejectedValue(
        new NotFoundException('Usuario no encontrado'),
      );

      await expect(
        service.actualizarPerfil('id-fantasma', dto),
      ).rejects.toThrow(NotFoundException);
    });
  });
});