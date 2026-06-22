import { Injectable } from '@nestjs/common';
import { CreateProgresoDto } from './dto/create-progreso.dto';
import { UpdateProgresoDto } from './dto/update-progreso.dto';

@Injectable()
export class ProgresoService {
  create(createProgresoDto: CreateProgresoDto) {
    return 'This action adds a new progreso';
  }

  findAll() {
    return `This action returns all progreso`;
  }

  findOne(id: number) {
    return `This action returns a #${id} progreso`;
  }

  update(id: number, updateProgresoDto: UpdateProgresoDto) {
    return `This action updates a #${id} progreso`;
  }

  remove(id: number) {
    return `This action removes a #${id} progreso`;
  }
}
