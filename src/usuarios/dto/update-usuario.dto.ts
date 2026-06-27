import { PartialType, OmitType } from '@nestjs/mapped-types';
import { IsOptional, IsString, MinLength } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

// Se omite email y rol — no se cambian por el propio usuario
export class UpdateUsuarioDto extends PartialType(
  OmitType(CreateUsuarioDto, ['email', 'rol'] as const),
) {
  @IsOptional()
  @IsString()
  @MinLength(8)
  password?: string;

  @IsOptional()
  @IsString()
  nombre?: string;

  @IsOptional()
  @IsString()
  apellido?: string;
}
