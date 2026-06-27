import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class CreateRespuestaDto {
  @IsString()
  @IsNotEmpty()
  usuarioId!: string;

  @IsObject()
  @IsNotEmpty()
  respuestas!: Record<string, any>;
}