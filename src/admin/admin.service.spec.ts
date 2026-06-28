import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { UsuariosService } from '../usuarios/usuarios.service';

// ── Mocks ─────────────────────────────────────────────────────────────────
const mockUsuariosService = () => ({
  buscarPorId: jest.fn(),
  actualizar:  jest.fn(),
  // Añade aquí más métodos de UsuariosService si AdminService los utiliza
});

// ── Suite ─────────────────────────────────────────────────────────────────
describe('AdminService', () => {
  let service: AdminService;
  let usuariosService: ReturnType<typeof mockUsuariosService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        { 
          provide: UsuariosService, 
          useFactory: mockUsuariosService 
        },
      ],
    }).compile();

    service         = module.get<AdminService>(AdminService);
    usuariosService = module.get(UsuariosService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});