import { IsNotEmpty, IsString, IsNumber, IsObject } from 'class-validator';

export class CreateTestResultadoDto {
  @IsString()
  @IsNotEmpty()
  tipoTest?: string;

  @IsObject()
  @IsNotEmpty()
  respuestas?: any;

  @IsNumber()
  @IsNotEmpty()
  puntajeTotal?: number;

  @IsString()
  @IsNotEmpty()
  diagnosticoPreliminar?: string;
}