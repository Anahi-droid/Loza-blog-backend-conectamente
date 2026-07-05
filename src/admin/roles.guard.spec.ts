import { Test, TestingModule } from '@nestjs/testing';
import { RolesGuard } from './roles.guard';
import { Reflector } from '@nestjs/core';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  const mockReflector = {
    getAllAndOverride: jest.fn(),
  };

  const mockExecutionContext = {
    getHandler: jest.fn(),
    getClass: jest.fn(),
    switchToHttp: jest.fn().mockReturnThis(),
    getRequest: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RolesGuard,
        { provide: Reflector, useValue: mockReflector },
      ],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
    reflector = module.get<Reflector>(Reflector);
  });

  it('debe retornar true si no se requieren roles específicos', () => {
    mockReflector.getAllAndOverride.mockReturnValue(null);

    const resultado = guard.canActivate(mockExecutionContext as unknown as ExecutionContext);

    expect(resultado).toBe(true);
  });

  it('debe lanzar ForbiddenException si el rol del usuario no coincide con los requeridos', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN']);
    mockExecutionContext.getRequest.mockReturnValue({ user: { rol: 'PACIENTE' } });

    expect(() =>
      guard.canActivate(mockExecutionContext as unknown as ExecutionContext),
    ).toThrow(ForbiddenException);
  });

  it('debe retornar true si el rol del usuario está incluido en los requeridos', () => {
    mockReflector.getAllAndOverride.mockReturnValue(['ADMIN', 'PSICOLOGO']);
    mockExecutionContext.getRequest.mockReturnValue({ user: { rol: 'ADMIN' } });

    const resultado = guard.canActivate(mockExecutionContext as unknown as ExecutionContext);

    expect(resultado).toBe(true);
  });
});