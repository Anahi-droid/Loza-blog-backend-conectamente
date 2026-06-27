import { Controller, Get, Post, Body, Param, ParseUUIDPipe } from '@nestjs/common';
import { ProgresoService } from './progreso.service';
import { CreateProgresoDto } from './dto/create-progreso.dto';

@Controller('progreso')
export class ProgresoController {
  constructor(private readonly progresoService: ProgresoService) {}

  @Post()
  create(@Body() createProgresoDto: CreateProgresoDto) {
    return this.progresoService.create(createProgresoDto);
  }

  @Get()
  findAll() {
    return this.progresoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.progresoService.findOne(id);
  }

  @Get('paciente/:id')
  findByPaciente(@Param('id', ParseUUIDPipe) id: string) {
    return this.progresoService.findByPaciente(id);
  }
}