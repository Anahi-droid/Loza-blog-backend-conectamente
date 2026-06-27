import { IsNotEmpty, IsDateString, IsString, IsUUID } from 'class-validator';

export class CreateExcepcionDto {
  @IsUUID()
  @IsNotEmpty()
  psicologoId?: string;

  @IsDateString()
  @IsNotEmpty()
  fechaInicio?: string;

  @IsDateString()
  @IsNotEmpty()
  fechaFin?: string;

  @IsString()
  @IsNotEmpty()
  motivo?: string;
}