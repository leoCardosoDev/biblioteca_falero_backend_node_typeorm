import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Index, ManyToOne, JoinColumn } from 'typeorm'
import { UserTypeOrmEntity } from './user-entity'
import { RoleTypeOrmEntity } from './role-entity'

@Entity('logins')
export class LoginTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  password!: string

  @Column({ name: 'role_id', nullable: true })
  roleId?: string

  @ManyToOne(() => RoleTypeOrmEntity)
  @JoinColumn({ name: 'role_id' })
  role?: RoleTypeOrmEntity

  @Column({ nullable: true })
  status?: string

  @Column({ nullable: true })
  accessToken?: string

  @Index()
  @Column({ name: 'user_id' })
  userId!: string

  @ManyToOne(() => UserTypeOrmEntity)
  @JoinColumn({ name: 'user_id' })
  user?: UserTypeOrmEntity

  @Column({ type: 'datetime', nullable: true, name: 'deleted_at' })
  deletedAt?: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
