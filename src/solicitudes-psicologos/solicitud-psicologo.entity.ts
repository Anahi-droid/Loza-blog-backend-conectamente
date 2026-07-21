import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type EstadoSolicitudPsicologo = 'PENDIENTE' | 'APROBADA' | 'RECHAZADA';

@Entity('solicitudes_psicologos')
export class SolicitudPsicologo {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', default: 'PENDIENTE' })
  estado!: EstadoSolicitudPsicologo;

  @Column({ type: 'varchar' })
  nombre!: string;

  @Column({ type: 'varchar' })
  apellido!: string;

  @Column({ type: 'varchar' })
  email!: string;

  @Column({ type: 'varchar' })
  password!: string;

  @Column({ type: 'varchar' })
  licenciaProfesional!: string;

  @Column({ type: 'varchar', nullable: true })
  telefono?: string;

  @Column({ type: 'varchar', nullable: true })
  especialidad?: string;

  @Column({ type: 'text', nullable: true })
  mensajeAdicional?: string;

  @Column({ type: 'text', nullable: true })
  adminObservaciones?: string;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  actualizadoEn!: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'procesado_en' })
  procesadoEn?: Date;
}