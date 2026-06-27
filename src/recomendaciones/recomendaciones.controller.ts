import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { RecomendacionesService } from './recomendaciones.service';
import { CreateRecomendacionDto } from './dto/create-recomendacione.dto';

@Controller('recomendaciones')
export class RecomendacionesController {
  constructor(private readonly recomendacionesService: RecomendacionesService) {}

  @Post()
  create(@Body() createRecomendacionDto: CreateRecomendacionDto) {
    return this.recomendacionesService.create(createRecomendacionDto);
  }

  @Get()
  findAll() {
    return this.recomendacionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.recomendacionesService.findOne(id);
  }

  @Get('paciente/:id')
  findByPaciente(@Param('id', ParseUUIDPipe) id: string) {
    return this.recomendacionesService.findByPaciente(id);
  }
}