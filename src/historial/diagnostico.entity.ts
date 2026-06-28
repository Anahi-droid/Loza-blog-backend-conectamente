import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Historial } from './historial.entity';

@Entity('diagnosticos')
export class Diagnostico {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ type: 'varchar', length: 50 })
  codigoCIE10?: string;

  @Column({ type: 'text' })
  descripcion?: string;

  @ManyToOne(() => Historial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historial_id' })
  historial?: Historial;

  @CreateDateColumn()
  fechaDiagnostico?: Date;
}