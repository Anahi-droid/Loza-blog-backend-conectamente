import { Controller, Get, Post, Body, Param, Patch, Delete, ParseUUIDPipe, UseGuards, Req } from '@nestjs/common';
import { RecomendacionesService } from './recomendaciones.service';
import { CreateRecomendacionDto } from './dto/create-recomendacione.dto';
import { UpdateRecomendacionDto } from './dto/update-recomendacione.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecomendacionAccessGuard } from '../auth/recomendacion-access.guard';

@Controller('recomendaciones')
export class RecomendacionesController {
  constructor(private readonly recomendacionesService: RecomendacionesService) {}

  @UseGuards(JwtAuthGuard) 
  @Post()
  create(@Req() req, @Body() createRecomendacionDto: CreateRecomendacionDto) {
    const psicologoId = req.user.psicologoId || req.user.id;
    return this.recomendacionesService.create(createRecomendacionDto, psicologoId);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Req() req) {
    const usuarioId = req.user.id;
    const rol = req.user.rol;
    return this.recomendacionesService.findAll(usuarioId, rol);
  }

  @Get('progresos/todos')
  findAllProgresos() {
    return this.recomendacionesService.findAllProgresos();
  }

  @UseGuards(JwtAuthGuard, RecomendacionAccessGuard)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.recomendacionesService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('paciente/:id')
  findByPaciente(@Param('id', ParseUUIDPipe) id: string, @Req() req) {
    const usuarioId = req.user.id;
    const rol = req.user.rol;
    return this.recomendacionesService.findByPaciente(id, usuarioId, rol);
  }

  @UseGuards(JwtAuthGuard, RecomendacionAccessGuard)
  @Patch(':id')
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRecomendacionDto: UpdateRecomendacionDto,
  ) {
    return this.recomendacionesService.update(id, updateRecomendacionDto);
  }

  @UseGuards(JwtAuthGuard, RecomendacionAccessGuard)
  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.recomendacionesService.remove(id);
  }

  @UseGuards(JwtAuthGuard) 
  @Post('progresos')
  createProgreso(
    @Body('historialId', ParseUUIDPipe) historialId: string,
    @Body('fecha') fecha: string,
    @Body('estadoEmocional') estadoEmocional: string,
    @Body('avance') avance: string,
    @Body('observaciones') observaciones: string,
  ) {
    return this.recomendacionesService.createProgreso(historialId, new Date(fecha), estadoEmocional, avance, observaciones);
  }

  @Get('progresos/:id')
  findOneProgreso(@Param('id', ParseUUIDPipe) id: string) {
    return this.recomendacionesService.findOneProgreso(id);
  }

  @UseGuards(JwtAuthGuard) 
  @Patch('progresos/:id')
  updateProgreso(
    @Param('id', ParseUUIDPipe) id: string,
    @Body('estadoEmocional') estadoEmocional?: string,
    @Body('avance') avance?: string,
    @Body('observaciones') observaciones?: string,
  ) {
    return this.recomendacionesService.updateProgreso(id, estadoEmocional, avance, observaciones);
  }

  @UseGuards(JwtAuthGuard) 
  @Delete('progresos/:id')
  removeProgreso(@Param('id', ParseUUIDPipe) id: string) {
    return this.recomendacionesService.removeProgreso(id);
  }
}