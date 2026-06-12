import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Rol } from '../../usuarios/usuario.entity';

// El admin puede crear PSICOLOGO u otro ADMIN — no PACIENTE (ese se registra solo)
export class CreateStaffDto {
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

  @IsEnum(['PSICOLOGO', 'ADMIN'], {
    message: 'Solo se puede crear staff con rol PSICOLOGO o ADMIN',
  })
  rol?: Exclude<Rol, 'PACIENTE'>;
}