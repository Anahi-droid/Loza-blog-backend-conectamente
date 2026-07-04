import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Historial } from './historial.entity';

@Entity('diagnosticos')
export class Diagnostico {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50, name: 'codigo_cie10' })
  codigoCIE10!: string;

  @Column({ type: 'text' })
  descripcion!: string;

  @ManyToOne(() => Historial, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'historial_id' }) 
  historial!: Historial;

  @CreateDateColumn({ name: 'fecha_diagnostico' })
  fechaDiagnostico!: Date;
}