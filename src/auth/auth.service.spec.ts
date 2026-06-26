import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { UsuariosService } from '../usuarios/usuarios.service';

// ── Mocks ─────────────────────────────────────────────────────────────────

const mockUsuariosService = () => ({
  crear:            jest.fn(),
  buscarPorEmail:   jest.fn(),
  comparePasswords: jest.fn(),
});

const mockJwtService = () => ({
  sign: jest.fn().mockReturnValue('mock.jwt.token'),
});

const usuarioActivo = {
  id:       'uuid-001',
  email:    'ana@clinica.com',
  password: 'hashed_pass',
  nombre:   'Ana',
  apellido: 'García',
  rol:      'PACIENTE',
  activo:   true,
};

// ── Suite ─────────────────────────────────────────────────────────────────

describe('AuthService', () => {
  let service: AuthService;
  let usuariosService: ReturnType<typeof mockUsuariosService>;
  let jwtService: ReturnType<typeof mockJwtService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsuariosService, useFactory: mockUsuariosService },
        { provide: JwtService,      useFactory: mockJwtService },
      ],
    }).compile();

    service         = module.get<AuthService>(AuthService);
    usuariosService = module.get(UsuariosService);
    jwtService      = module.get(JwtService);
  });

  // ── register ─────────────────────────────────────────────────────────────

  describe('register', () => {
    const dto = {
      email:    'nuevo@test.com',
      password: 'Password123',
      nombre:   'Carlos',
      apellido: 'Ruiz',
    };

    it('debe registrar al usuario con rol PACIENTE forzado', async () => {
      const { password, ...sinPassword } = usuarioActivo;
      usuariosService.crear.mockResolvedValue(usuarioActivo);

      const resultado = await service.register(dto);

      expect(usuariosService.crear).toHaveBeenCalledWith({
        ...dto,
        rol: 'PACIENTE', // el rol siempre es PACIENTE en registro público
      });
      expect(resultado).not.toHaveProperty('password');
    });

    it('no debe exponer la contraseña en la respuesta', async () => {
      usuariosService.crear.mockResolvedValue(usuarioActivo);

      const resultado = await service.register(dto);

      expect(resultado).not.toHaveProperty('password');
      expect(resultado).toHaveProperty('email');
    });
  });

  // ── login ─────────────────────────────────────────────────────────────────

  describe('login', () => {
    const dto = { email: 'ana@clinica.com', password: 'Password123' };

    it('debe retornar un accessToken cuando las credenciales son válidas', async () => {
      usuariosService.buscarPorEmail.mockResolvedValue(usuarioActivo);
      usuariosService.comparePasswords.mockResolvedValue(true);

      const resultado = await service.login(dto);

      expect(resultado).toHaveProperty('accessToken');
      expect(resultado.accessToken).toBe('mock.jwt.token');
    });

    it('debe llamar a jwtService.sign con el payload correcto (sub, rol, email)', async () => {
      usuariosService.buscarPorEmail.mockResolvedValue(usuarioActivo);
      usuariosService.comparePasswords.mockResolvedValue(true);

      await service.login(dto);

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub:   usuarioActivo.id,
        rol:   usuarioActivo.rol,
        email: usuarioActivo.email,
      });
    });

    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      usuariosService.buscarPorEmail.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('debe lanzar UnauthorizedException si la contraseña es incorrecta', async () => {
      usuariosService.buscarPorEmail.mockResolvedValue(usuarioActivo);
      usuariosService.comparePasswords.mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
      expect(jwtService.sign).not.toHaveBeenCalled();
    });

    it('debe usar el mismo mensaje de error para usuario no encontrado y pass incorrecta (evita enumeración)', async () => {
      usuariosService.buscarPorEmail.mockResolvedValue(null);

      let errorSinUsuario: any;
      try { await service.login(dto); } catch (e) { errorSinUsuario = e; }

      usuariosService.buscarPorEmail.mockResolvedValue(usuarioActivo);
      usuariosService.comparePasswords.mockResolvedValue(false);

      let errorPassMal: any;
      try { await service.login(dto); } catch (e) { errorPassMal = e; }

      expect(errorSinUsuario.message).toBe(errorPassMal.message);
    });
  });
});