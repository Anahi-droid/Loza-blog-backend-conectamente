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
  id?: string;

  @Column({ type: 'timestamp' })
  fechaInicio?: Date;

  @Column({ type: 'timestamp' })
  fechaFin?: Date;

  @Column({ type: 'varchar', length: 255 })
  motivo?: string;

  @ManyToOne(() => Psicologo, (psicologo) => psicologo.excepciones, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'psicologo_id' })
  psicologo?: Psicologo;

  @CreateDateColumn()
  creadoEn?: Date;
}