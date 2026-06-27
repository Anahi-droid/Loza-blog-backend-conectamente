import { IsString, IsNotEmpty, IsArray, ValidateNested, IsOptional, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';

class PreguntaDto {
  @IsString()
  @IsNotEmpty()
  pregunta?: string;

  @IsEnum(['TEXTO', 'ESCALA', 'MULTIPLE'])
  tipo?: 'TEXTO' | 'ESCALA' | 'MULTIPLE';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  opciones?: string[];
}

export class CreateEncuestaDto {
  @IsString()
  @IsNotEmpty()
  titulo?: string;

  @IsString()
  @IsNotEmpty()
  descripcion?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PreguntaDto)
  preguntas?: PreguntaDto[];
}