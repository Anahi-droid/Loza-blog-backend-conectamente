import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { PsicologosService } from './psicologos.service';
import { Psicologo } from '../psicologos/psicologo.entity';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('psicologos')
export class PsicologosController {
  constructor(private readonly psicologosService: PsicologosService) {}


  @Get()
  listarTodos() {
    return this.psicologosService.listarTodos();
  }

  @UseGuards(JwtAuthGuard)
  @Post('perfil/:usuarioId')
  crearPerfil(
    @Param('usuarioId') usuarioId: string,
    @Body() datosProf: Partial<Psicologo>
  ) {
    return this.psicologosService.crearPerfil(usuarioId, datosProf);
  }
}