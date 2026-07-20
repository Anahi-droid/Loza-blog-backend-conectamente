import { IsEmail, IsArray, IsNotEmpty, IsString, MinLength, IsOptional } from 'class-validator';

export class CreatePsicologoDto {
  @IsString()
  @IsNotEmpty()
  nombre!: string;

  @IsString()
  @IsNotEmpty()
  apellido!: string;

  @IsEmail({}, { message: 'El formato de email no es válido' })
  email!: string;

  @IsString()
  @MinLength(8, { message: 'La contraseña debe tener al menos 8 caracteres' })
  password!: string;

  @IsArray({ message: 'Las especialidades deben venir en un arreglo de IDs' })
  @IsString({ each: true, message: 'Cada ID de especialidad debe ser una cadena de texto' })
  especialidadesIds!: string[]; // 👈 🎯 Nuestro arreglo relacional ManyToMany

  @IsString()
  @IsNotEmpty()
  licenciaProfesional!: string;

  @IsString()
  @IsOptional()
  telefono?: string;
}