import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('chats')
@UseGuards(JwtAuthGuard) 
export class ChatsController {
  constructor(private readonly chatsService: ChatsService) {}

  @Post()
  async guardarMensaje(@Req() req, @Body() createChatDto: CreateChatDto) {
    return this.chatsService.enviarMensaje(req.user.id, createChatDto);
  }

  @Get('/:usuarioId')
  async obtenerHistorial(@Req() req, @Param('usuarioId') usuarioId: string) {
    return this.chatsService.obtenerHistorial(req.user.id, usuarioId);
  }
}