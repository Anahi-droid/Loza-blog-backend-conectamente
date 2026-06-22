import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CitasModule } from './citas/citas.module';
import { UsuariosModule } from './usuarios/usuarios.module';
import { PsicologosModule } from './psicologos/psicologos.module';
import { AgendaModule } from './agenda/agenda.module';

@Module({
  imports: [CitasModule, UsuariosModule, PsicologosModule, AgendaModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
