import { IsUUID, IsNotEmpty, IsDateString, IsString } from 'class-validator';

export class CreateRecomendacionDto {
  @IsUUID('4', { message: 'El pacienteId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El id del paciente es requerido' })
  pacienteId?: string;

  @IsUUID('4', { message: 'El psicologoId debe ser un UUID válido' })
  @IsNotEmpty({ message: 'El id del psicólogo es requerido' })
  psicologoId?: string;

  @IsDateString({}, { message: 'La fecha debe ser una cadena ISO válida' })
  @IsNotEmpty({ message: 'La fecha de asignación es requerida' })
  fecha?: Date;

  @IsString()
  @IsNotEmpty({ message: 'El título de la recomendación es requerido' })
  titulo?: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción no puede estar vacía' })
  descripcion?: string;
}