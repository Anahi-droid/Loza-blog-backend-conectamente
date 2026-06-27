import { IsBoolean, IsDateString, IsOptional, IsUUID } from 'class-validator';

export class CreateAgendaDto {
  @IsDateString()
  fechaHoraInicio?: Date;

  @IsOptional()
  @IsBoolean()
  estaReservado?: boolean;

  @IsUUID()
  psicologoId?: string;
}