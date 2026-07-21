import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SolicitudPsicologo } from './solicitud-psicologo.entity';
import { Usuario } from '../usuarios/usuario.entity';
import { Psicologo } from '../psicologos/psicologo.entity';

@Injectable()
export class SolicitudesPsicologosService {
  constructor(
    @InjectRepository(SolicitudPsicologo)
    private readonly solicitudRepo: Repository<SolicitudPsicologo>,
    @InjectRepository(Usuario)
    private readonly usuarioRepo: Repository<Usuario>,
    @InjectRepository(Psicologo)
    private readonly psicologoRepo: Repository<Psicologo>,
  ) {}

  // 1. Registro público de postulación
  async crearSolicitud(datos: any) {
    const existeEmail = await this.usuarioRepo.findOne({ where: { email: datos.email } });
    if (existeEmail) {
      throw new ConflictException('El correo ya pertenece a un usuario activo.');
    }

    const existeSolicitud = await this.solicitudRepo.findOne({
      where: { email: datos.email, estado: 'PENDIENTE' },
    });
    if (existeSolicitud) {
      throw new ConflictException('Ya existe una solicitud pendiente con este correo.');
    }

    const hashedPassword = await bcrypt.hash(datos.password, 10);

    const nuevaSolicitud = this.solicitudRepo.create({
      ...datos,
      password: hashedPassword,
    });

    return await this.solicitudRepo.save(nuevaSolicitud);
  }

  // 2. Administrador consulta postulaciones
  async obtenerTodas() {
    return await this.solicitudRepo.find({
      order: { creadoEn: 'DESC' },
    });
  }

  // 3. Administrador APRUEBA (Crea la cuenta de usuario + perfil de psicólogo)
  // 3. Administrador APRUEBA (Crea la cuenta de usuario + perfil de psicólogo)
  async aprobar(id: string, adminObservaciones?: string) {
    const solicitud = await this.solicitudRepo.findOne({ where: { id } });
    if (!solicitud) {
      throw new NotFoundException('La solicitud no existe.');
    }

    solicitud.estado = 'APROBADA';
    solicitud.adminObservaciones = adminObservaciones;
    solicitud.procesadoEn = new Date();
    await this.solicitudRepo.save(solicitud);

    // 1. Crear Usuario con rol PSICOLOGO
    const nuevoUsuario = this.usuarioRepo.create({
      nombre: solicitud.nombre,
      apellido: solicitud.apellido,
      email: solicitud.email,
      password: solicitud.password,
      rol: 'PSICOLOGO',
      activo: true,
    });
    const usuarioGuardado = await this.usuarioRepo.save(nuevoUsuario);

    // 2. Crear Perfil de Psicólogo asignando la relación explícita de TypeORM
    const nuevoPsicologo = new Psicologo();
    nuevoPsicologo.usuario = usuarioGuardado;
    
    // Mapeo seguro de campos según el esquema de tu base de datos
    if ('licenciaProfesional' in nuevoPsicologo) {
      (nuevoPsicologo as any).licenciaProfesional = solicitud.licenciaProfesional;
    } else if ('numColegiatura' in nuevoPsicologo) {
      (nuevoPsicologo as any).numColegiatura = solicitud.licenciaProfesional;
    }

    if ('telefono' in nuevoPsicologo) {
      (nuevoPsicologo as any).telefono = solicitud.telefono;
    }

    if ('especialidad' in nuevoPsicologo) {
      (nuevoPsicologo as any).especialidad = solicitud.especialidad || 'Psicología Clínica';
    }

    await this.psicologoRepo.save(nuevoPsicologo);

    return { mensaje: 'Solicitud aprobada y cuenta de psicólogo creada con éxito.' };
  }

  // 4. Administrador RECHAZA
  async rechazar(id: string, adminObservaciones?: string) {
    const solicitud = await this.solicitudRepo.findOne({ where: { id } });
    if (!solicitud) {
      throw new NotFoundException('La solicitud no existe.');
    }

    solicitud.estado = 'RECHAZADA';
    solicitud.adminObservaciones = adminObservaciones;
    solicitud.procesadoEn = new Date();
    return await this.solicitudRepo.save(solicitud);
  }
}