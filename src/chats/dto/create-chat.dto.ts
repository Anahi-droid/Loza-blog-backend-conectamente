import { IsNotEmpty, IsString } from 'class-validator';

export class CreateChatDto {
  @IsString()
  @IsNotEmpty()
  destinatarioId?: string;

  @IsString()
  @IsNotEmpty()
  mensaje?: string;
}