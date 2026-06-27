import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsuariosService } from '../usuarios/usuarios.service';
import { RegisterDto } from './dto/create-auth.dto';
import { LoginDto } from './dto/update-auth.dto';
import { JwtPayload } from './auth.entity';

@Injectable()
export class AuthService {
  constructor(
    private readonly usuariosService: UsuariosService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const usuario = await this.usuariosService.crear({
      ...dto,
      rol: 'PACIENTE',
    });

    const { password, ...resultado } = usuario;
    return resultado;
  }

  async login(dto: LoginDto): Promise<{ accessToken: string }> {
    if (!dto.email || !dto.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const usuario = await this.usuariosService.buscarPorEmail(dto.email);

    if (!usuario || !usuario.password) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const passwordValida = await this.usuariosService.comparePasswords(
      dto.password,
      usuario.password,
    );

    if (!passwordValida) {
      throw new UnauthorizedException('Credenciales inválidas');
    }

    const payload: JwtPayload = {
      sub: usuario.id!,
      rol: usuario.rol!,
      email: usuario.email!,
    };

    return {
      accessToken: this.jwtService.sign(payload),
    };
  }
}