import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsString,
  MinLength,
} from 'class-validator';
import { Rol } from '../usuario.entity';

export class CreateUsuarioDto {
  @IsEmail({}, { message: 'El email no tiene un formato válido' })
  email?: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password?: string;

  @IsString()
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre?: string;

  @IsString()
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido?: string;

  @IsEnum(['PACIENTE', 'PSICOLOGO', 'ADMIN'], {
    message: 'El rol debe ser PACIENTE, PSICOLOGO o ADMIN',
  })
  rol?: Rol;
}
