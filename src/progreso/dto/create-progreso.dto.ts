import { IsInt, IsNotEmpty, IsDateString, IsString, IsOptional } from 'class-validator';

export class CreateProgresoDto {
  @IsInt()
  @IsNotEmpty()
  historialId: number;

  @IsDateString()
  @IsNotEmpty()
  fecha: Date;

  @IsString()
  @IsNotEmpty()
  estadoEmocional: string;

  @IsString()
  @IsNotEmpty()
  avance: string;

  @IsString()
  @IsOptional()
  observaciones?: string;
}