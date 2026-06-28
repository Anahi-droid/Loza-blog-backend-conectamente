import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Historial } from './historial.entity';

@Entity('tratamientos')
export class Tratamiento {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', length: 150 })
  nombrePlan?: string;

  @Column({ type: 'text' })
  objetivos?: string;

  @ManyToOne(() => Historial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historial_id' })
  historial?: Historial;

  @CreateDateColumn()
  creadoEn?: Date;
}