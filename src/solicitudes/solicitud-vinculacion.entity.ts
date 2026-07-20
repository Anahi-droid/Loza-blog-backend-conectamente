import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../usuarios/usuario.entity';
import { Psicologo } from '../psicologos/psicologo.entity';

export type EstadoSolicitud = 'PENDIENTE' | 'ACEPTADA' | 'RECHAZADA';

@Entity('solicitudes_vinculacion')
export class SolicitudVinculacion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', default: 'PENDIENTE' })
  estado!: EstadoSolicitud;

  @Column({ type: 'text', nullable: true })
  mensajeInicial?: string;

  // El usuario (paciente huerfano) que inicia la solicitud
  @ManyToOne(() => Usuario, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'paciente_id' })
  paciente!: Usuario;

  // El especialista al que se le solicita atención
  @ManyToOne(() => Psicologo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'psicologo_id' })
  psicologo!: Psicologo;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn!: Date;
}