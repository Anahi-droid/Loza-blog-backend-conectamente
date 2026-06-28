import { Controller, Get, Post, Body, Param, UseGuards, Patch, Delete } from '@nestjs/common';
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

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  actualizar(
    @Param('id') id: string,
    @Body() datosActualizar: Partial<Psicologo>
  ) {
    return this.psicologosService.actualizar(id, datosActualizar);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async eliminar(@Param('id') id: string) {
    await this.psicologosService.eliminar(id);
    return { message: `Perfil profesional con ID ${id} eliminado con éxito.` };
  }
}