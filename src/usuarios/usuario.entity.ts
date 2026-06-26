import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export type Rol = 'PACIENTE' | 'PSICOLOGO' | 'ADMIN';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn('uuid')
  id?: string;

  @Column({ unique: true })
  email?: string;

  @Column()
  password?: string;

  @Column()
  nombre?: string;

  @Column()
  apellido?: string;

  @Column({ type: 'varchar', default: 'PACIENTE' })
  rol?: Rol;

  @Column({ default: true })
  activo?: boolean;

  @CreateDateColumn()
  creadoEn?: Date;

  @UpdateDateColumn()
  actualizadoEn?: Date;
}
