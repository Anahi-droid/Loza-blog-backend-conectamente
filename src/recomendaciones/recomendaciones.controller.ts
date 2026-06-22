import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecomendacionesService } from './recomendaciones.service';
import { CreateRecomendacioneDto } from './dto/create-recomendacione.dto';
import { UpdateRecomendacioneDto } from './dto/update-recomendacione.dto';

@Controller('recomendaciones')
export class RecomendacionesController {
  constructor(private readonly recomendacionesService: RecomendacionesService) {}

  @Post()
  create(@Body() createRecomendacioneDto: CreateRecomendacioneDto) {
    return this.recomendacionesService.create(createRecomendacioneDto);
  }

  @Get()
  findAll() {
    return this.recomendacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recomendacionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecomendacioneDto: UpdateRecomendacioneDto) {
    return this.recomendacionesService.update(+id, updateRecomendacioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recomendacionesService.remove(+id);
  }
}
