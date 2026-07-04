import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { UsuariosService } from '../usuarios/usuarios.service';
import { UnauthorizedException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockConfigService = {
    get: jest.fn((key: string) => {
      if (key === 'JWT_SECRET') return 'secretKeyPorDefecto';
      return null;
    }),
  };

  const mockUsuariosService = {
    buscarPorId: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: UsuariosService, useValue: mockUsuariosService },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('debe estar definido y haber ejecutado el constructor', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('debe lanzar UnauthorizedException si el usuario no existe', async () => {
      mockUsuariosService.buscarPorId.mockResolvedValue(null);
      const payload = { sub: 'id-falso', email: 'test@c.com', rol: 'PACIENTE', psicologoId: null };
      
      await expect(strategy.validate(payload)).rejects.toThrow(UnauthorizedException);
    });

    it('debe retornar los datos del usuario si es válido', async () => {
      const mockUsuario = { id: 'user-123', email: 'test@c.com' };
      mockUsuariosService.buscarPorId.mockResolvedValue(mockUsuario);

      const payload = { sub: 'user-123', email: 'test@c.com', rol: 'PACIENTE', psicologoId: null };
      const result = await strategy.validate(payload);

      expect(result).toEqual({
        id: 'user-123',
        email: 'test@c.com',
        rol: 'PACIENTE',
        psicologoId: null,
      });
    });
  });
});