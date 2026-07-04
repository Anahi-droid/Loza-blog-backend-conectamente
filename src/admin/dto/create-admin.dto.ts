import { IsEmail, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { Rol } from '../../usuarios/usuario.entity';

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