import { IsInt, IsNotEmpty, IsDateString, IsString, IsOptional } from 'class-validator';

export class CreateHistorialDto {
  @IsInt()
  @IsNotEmpty()
  pacienteId?: number;

  @IsInt()
  @IsNotEmpty()
  psicologoId?: number;

  @IsDateString()
  @IsNotEmpty()
  fechaSesion?: Date;

  @IsString()
  @IsNotEmpty()
  diagnostico?: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}