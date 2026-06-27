import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose'; // <-- 1. IMPORTA EL MÓDULO DE MONGOOSE

import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { PerfilModule } from './perfil/perfil.module';
import { AdminModule } from './admin/admin.module';
import { HistorialModule } from './historial/historial.module';
import { ProgresoModule } from './progreso/progreso.module';
import { RecomendacionesModule } from './recomendaciones/recomendaciones.module';
import { Usuario } from './usuarios/usuario.entity';
import { Psicologo } from './psicologos/psicologo.entity';
import { Cita } from './citas/cita.entity';
import { Historial } from './historial/historial.entity';
import { Progreso } from './progreso/progreso.entity';
import { Recomendacion } from './recomendaciones/recomendacion.entity';
import { Agenda } from './agenda/agenda.entity';
import { Especialidad } from './especialidades/especialidade.entity'; 
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { EncuestasModule } from './encuestas/encuestas.module';
import { EspecialidadesModule } from './especialidades/especialidades.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    
    // Conexión Relacional (PostgreSQL)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASS'), 
        database: config.get('DB_NAME'),
        entities: [Usuario, Psicologo, Cita, Historial, Progreso, Recomendacion, Agenda, Especialidad], 
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),
    // Conxion a mongo db :)
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGO_URI'),
      }),
    }),

    UsuariosModule,
    AuthModule,
    PerfilModule,
    AdminModule,
    HistorialModule,
    ProgresoModule,
    RecomendacionesModule,
    NotificacionesModule,
    EncuestasModule,
    EspecialidadesModule,
  ],
})
export class AppModule {}