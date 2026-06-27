import { PartialType } from '@nestjs/mapped-types';
import { CreateRecomendacionDto } from './create-recomendacione.dto';

export class UpdateRecomendacionDto extends PartialType(CreateRecomendacionDto) {}