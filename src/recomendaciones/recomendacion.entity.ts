import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Usuario } from '../../usuarios/usuario.entity';
import { Psicologo } from '../../psicologos/psicologo.entity';

@Entity('recomendaciones')
export class Recomendacion {
  @PrimaryGeneratedColumn('increment') 
  id: number;

  @Column({ name: 'paciente_id', type: 'int' })
  pacienteId: number;

  @Column({ name: 'psicologo_id', type: 'int' }) 
  psicologoId: number;

  @Column({ type: 'timestamp' })
  fecha: Date;

  @Column({ type: 'varchar', length: 255 })
  titulo: string;

  @Column({ type: 'text' })
  descripcion: string;

  @ManyToOne(() => Usuario, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'paciente_id' })
  paciente: Usuario;

  @ManyToOne(() => Psicologo, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'psicologo_id' })
  psicologo: Psicologo;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}