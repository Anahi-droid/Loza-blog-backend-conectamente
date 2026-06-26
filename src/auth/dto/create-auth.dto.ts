import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

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
}