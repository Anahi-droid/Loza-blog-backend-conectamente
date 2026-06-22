import { Injectable } from '@nestjs/common';
import { CreateRecomendacioneDto } from './dto/create-recomendacione.dto';
import { UpdateRecomendacioneDto } from './dto/update-recomendacione.dto';

@Injectable()
export class RecomendacionesService {
  create(createRecomendacioneDto: CreateRecomendacioneDto) {
    return 'This action adds a new recomendacione';
  }

  findAll() {
    return `This action returns all recomendaciones`;
  }

  findOne(id: number) {
    return `This action returns a #${id} recomendacione`;
  }

  update(id: number, updateRecomendacioneDto: UpdateRecomendacioneDto) {
    return `This action updates a #${id} recomendacione`;
  }

  remove(id: number) {
    return `This action removes a #${id} recomendacione`;
  }
}
