import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsuariosModule } from './usuarios/usuarios.module';
import { AuthModule } from './auth/auth.module';
import { PerfilModule } from './perfil/perfil.module';
import { AdminModule } from './admin/admin.module';
import { HistorialModule } from './historial/historial.module';
import { ProgresoModule } from './progreso/progreso.module';
import { RecomendacionesModule } from './recomendaciones/recomendaciones.module';
import { PsicologosModule } from './psicologos/psicologos.module';
import { AgendaModule } from './agenda/agenda.module';
import { Usuario } from './usuarios/usuario.entity';
import { Psicologo } from './psicologos/psicologo.entity';
import { Cita } from './citas/cita.entity';
import { CitasModule } from './citas/citas.module'; 
import { Historial } from './historial/historial.entity';
import { Progreso } from './progreso/progreso.entity';
import { Recomendacion } from './recomendaciones/recomendacion.entity';
import { Agenda } from './agenda/agenda.entity';
import { Especialidad } from './especialidades/especialidade.entity'; 
import { NotificacionesModule } from './notificaciones/notificaciones.module';
import { EncuestasModule } from './encuestas/encuestas.module';
import { EspecialidadesModule } from './especialidades/especialidades.module';

// 🚀 1. IMPORTAMOS LA ENTIDAD QUE FALTA
import { DisponibilidadExcepcion } from './psicologos/disponibilidad-excepcion.entity'; 

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
        // 🚀 2. AGREGASTE DisponibilidadExcepcion AL FINAL DE ESTE ARREGLO:
        entities: [
          Usuario, 
          Psicologo, 
          Cita, 
          Historial, 
          Progreso, 
          Recomendacion, 
          Agenda, 
          Especialidad, 
          DisponibilidadExcepcion
        ], 
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
    PsicologosModule,
    AgendaModule,
    CitasModule,
  ],
})
export class AppModule {}