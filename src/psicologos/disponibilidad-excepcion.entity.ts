import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
} from 'typeorm';
import { Psicologo } from './psicologo.entity';

@Entity('disponibilidad_excepciones')
export class DisponibilidadExcepcion {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'timestamp', name: 'fecha_inicio' })
  fechaInicio!: Date;

  @Column({ type: 'timestamp', name: 'fecha_fin' })
  fechaFin!: Date;

  @Column({ type: 'varchar', length: 255 })
  motivo!: string;

  @ManyToOne(() => Psicologo, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'psicologo_id' }) 
  psicologo!: Psicologo;

  @CreateDateColumn({ name: 'creado_en' })
  creadoEn!: Date;
}