import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Historial } from '../historial/historial.entity';

@Entity('progresos')
export class Progreso {
  @PrimaryGeneratedColumn('uuid') 
  id!: string;

  @Column({ type: 'timestamp' })
  fecha!: Date;

  @Column({ type: 'varchar', length: 255, name: 'estado_emocional' })
  estadoEmocional!: string;

  @Column({ type: 'text' })
  avance!: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @ManyToOne(() => Historial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historial_id' }) 
  historial!: Historial;

  @CreateDateColumn({ name: 'creado_en' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updatedAt!: Date;
}