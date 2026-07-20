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

  // 🎯 CORREGIDO: Ahora recibe la data unificada directamente en la raíz mediante POST /psicologos
  @Post()
  crearPerfil(@Body() datosUnificados: any) {
    return this.psicologosService.crearPerfilUnificado(datosUnificados);
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