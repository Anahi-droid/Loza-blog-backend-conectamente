import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { UsuariosService } from './usuarios.service';
import { CreateUsuarioDto } from './dto/create-usuario.dto';

@Controller('usuarios')
export class UsuariosController {
  constructor(private readonly usuariosService: UsuariosService) {}

  @Post()
  create(@Body() createUsuarioDto: CreateUsuarioDto) {
    return this.usuariosService.crear(createUsuarioDto);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usuariosService.buscarPorId(id);
  }

  // Comentamos temporalmente los métodos CRUD que no desarrollaron en su service
  // para evitar que frene tu compilación médica.
  /*
  @Get()
  findAll() {
    return this.usuariosService.findAll();
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUsuarioDto: any) {
    return this.usuariosService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usuariosService.remove(id);
  }
  */
}