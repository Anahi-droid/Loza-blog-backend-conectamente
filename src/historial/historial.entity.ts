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

@Entity('historiales')
export class Historial {
  @PrimaryGeneratedColumn('uuid') 
  id!: string;

  @Column({ type: 'timestamp', name: 'fecha_sesion' })
  fechaSesion!: Date;

  @Column({ type: 'text' })
  diagnostico!: string;

  @Column({ type: 'text', nullable: true })
  observaciones?: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'paciente_id' }) 
  paciente!: Usuario;

  @ManyToOne(() => Psicologo, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'psicologo_id' }) 
  psicologo!: Psicologo;

  @CreateDateColumn({ name: 'creado_en' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'actualizado_en' })
  updatedAt!: Date;
}