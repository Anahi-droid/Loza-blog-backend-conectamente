import { Controller, Post, Get, Body, Param, UseGuards, Req, Put, Delete } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('chats')
@ApiBearerAuth('jwt-auth')
@Controller('chats')
@UseGuards(JwtAuthGuard) 
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  @ApiOperation({ summary: 'Enviar un mensaje chat' })
  async guardarMensaje(@Req() req, @Body() createChatDto: CreateChatDto) {
    return this.chatsService.enviarMensaje(req.user.id, createChatDto);
  }

  @Get(':usuarioId')
  @ApiOperation({ summary: 'Obtener historial de chat con un usuario' })
  async obtenerHistorial(@Req() req, @Param('usuarioId') usuarioId: string) {
    return this.chatsService.obtenerHistorial(req.user.id, usuarioId);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Actualizar un mensaje existente' })
  async actualizarMensaje(@Req() req, @Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatsService.actualizarMensaje(req.user.id, id, updateChatDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Eliminar un mensaje' })
  async eliminarMensaje(@Req() req, @Param('id') id: string) {
    return this.chatsService.eliminarMensaje(req.user.id, id);
  }
}