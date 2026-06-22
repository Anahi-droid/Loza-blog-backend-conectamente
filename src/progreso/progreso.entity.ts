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
  @PrimaryGeneratedColumn('increment') 
  id: number;

  @Column({ name: 'historial_id', type: 'int' })
  historialId: number;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ type: 'varchar', length: 255 })
  estadoEmocional: string;

  @Column({ type: 'text' })
  avance: string;

  @Column({ type: 'text', nullable: true })
  observaciones: string;

  @ManyToOne(() => Historial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historial_id' })
  historial: Historial;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}