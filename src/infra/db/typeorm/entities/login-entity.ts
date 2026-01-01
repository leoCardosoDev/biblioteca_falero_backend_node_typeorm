import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn } from 'typeorm'

@Entity('logins')
export class LoginTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  password!: string


  @Column({ nullable: true })
  role?: string

  @Column({ nullable: true })
  status?: string

  @Column({ nullable: true })
  accessToken?: string

  @Column()
  userId!: string

  @Column({ type: 'datetime', nullable: true, name: 'deleted_at' })
  deletedAt?: Date

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date
}
