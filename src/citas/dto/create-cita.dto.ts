import { IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCitaDto {
  @ApiProperty({ 
    description: 'ID del bloque de agenda del psicólogo', 
    example: 'e106662c-27ec-4240-8f33-fce19e9f8027' 
  })
  @IsNotEmpty({ message: 'El agendaId es obligatorio.' })
  @IsUUID('4', { message: 'El agendaId debe ser un UUID válido.' })
  agendaId!: string; 

  @ApiProperty({ 
    description: 'Motivo de la consulta psicológica', 
    example: 'Estrés académico intenso por exámenes finales.' 
  })
  @IsNotEmpty({ message: 'El motivo de la consulta no puede estar vacío.' })
  @IsString({ message: 'El motivo de la consulta debe ser un texto válido.' })
  motivoConsulta!: string; 
}