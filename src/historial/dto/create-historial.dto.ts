import { IsUUID, IsNotEmpty, IsDateString, IsString, IsOptional } from 'class-validator';

export class CreateHistorialDto {
  @IsUUID('4', { message: 'El pacienteId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El id del paciente es requerido' })
  pacienteId?: string;

  @IsDateString({}, { message: 'La fecha de la sesión debe ser una cadena ISO válida' })
  @IsNotEmpty({ message: 'La fecha de sesión es requerida' })
  fechaSesion?: Date;

  @IsString()
  @IsNotEmpty({ message: 'El diagnóstico no puede estar vacío' })
  diagnostico?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}