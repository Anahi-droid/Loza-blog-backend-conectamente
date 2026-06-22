import { PartialType } from '@nestjs/swagger';
import { CreateRecomendacioneDto } from './create-recomendacione.dto';

export class UpdateRecomendacioneDto extends PartialType(CreateRecomendacioneDto) {}
