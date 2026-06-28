import { IsUUID, IsNotEmpty, IsDateString, IsString, IsOptional } from 'class-validator';

export class CreateProgresoDto {
  @IsUUID('4', { message: 'El historialId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El id del historial clínico es requerido' })
  historialId?: string;

  @IsDateString({}, { message: 'La fecha debe ser una cadena ISO válida' })
  @IsNotEmpty({ message: 'La fecha de registro es requerida' })
  fecha?: Date;

  @IsString()
  @IsNotEmpty({ message: 'El estado emocional es requerido' })
  estadoEmocional?: string;

  @IsString()
  @IsNotEmpty({ message: 'El avance del paciente es requerido' })
  avance?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}