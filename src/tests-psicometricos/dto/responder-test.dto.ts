import { IsObject, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class ResponderTestDto {
  @IsObject()
  @IsNotEmpty()
  respuestas!: Record<string, any>;

  @IsNumber()
  @IsNotEmpty()
  puntajeTotal!: number;

  @IsString()
  @IsNotEmpty()
  diagnostico!: string;

  @IsObject()
  @IsNotEmpty()
  desglose!: Record<string, any>;

  alertaCritica?: boolean;
}