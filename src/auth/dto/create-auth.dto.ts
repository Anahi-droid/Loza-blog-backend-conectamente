import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsEnum } from 'class-validator';
import type { Rol } from '../../usuarios/usuario.entity';

export class RegisterDto {
  @IsEmail({}, { message: 'Email inválido' })
  email?: string;

  @IsString()
  @MinLength(8)
  password?: string;

  @IsString()
  @IsNotEmpty()
  nombre?: string;

  @IsString()
  @IsNotEmpty()
  apellido?: string;

  @IsOptional()
  @IsEnum(['PACIENTE', 'PSICOLOGO', 'ADMIN'], {
    message: 'El rol debe ser PACIENTE, PSICOLOGO o ADMIN',
  })
  rol?: Rol;
}