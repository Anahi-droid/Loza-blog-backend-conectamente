import { IsDateString, IsEmail, IsOptional, IsString, IsUUID, Length } from 'class-validator';

export class CreatePacienteDto {
  // 🚀 CAMPOS DE USUARIO BASE (Declarados para que NestJS no los rechace ni limpie)
  @IsString()
  @Length(2, 100)
  nombre: string;

  @IsString()
  @Length(2, 100)
  apellido: string;

  @IsEmail({}, { message: 'El formato del correo electrónico no es válido' })
  email: string;

  @IsOptional()
  @IsUUID()
  usuarioId?: string; 

  // 🚀 Volvemos a IsDateString de forma segura
  @IsDateString({}, { message: 'La fecha de nacimiento debe ser una fecha válida' })
  fechaNacimiento: string;

  @IsOptional()
  @IsString()
  @Length(1, 50)
  genero?: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  ocupacion?: string;

  @IsOptional()
  @IsString()
  @Length(1, 20)
  telefonoEmergencia?: string;

  @IsOptional()
  @IsString()
  @Length(1, 150)
  contactoEmergenciaNombre?: string;

  @IsOptional()
  @IsString()
  @Length(1, 10)
  tipoSangre?: string;

  @IsOptional()
  @IsString()
  antecedentesMedicos?: string;

  @IsOptional()
  @IsString()
  motivoConsultaInicial?: string;
}