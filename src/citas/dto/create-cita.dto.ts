import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCitaDto {
  @IsNotEmpty({ message: 'El agendaId es obligatorio.' })
  @IsUUID('4', { message: 'El agendaId debe ser un UUID válido.' })
  agendaId!: string; 

  @IsNotEmpty({ message: 'El motivo de la consulta no puede estar vacío.' })
  @IsString({ message: 'El motivo de la consulta debe ser un texto válido.' })
  motivoConsulta!: string; 

  // 🚀 Opcional: El psicólogo envía el ID del paciente desde el frontend
  @IsOptional()
  @IsUUID('4', { message: 'El pacienteId debe ser un UUID válido.' })
  pacienteId?: string;
}