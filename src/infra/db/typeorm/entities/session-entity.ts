import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm'

@Entity('user_sessions')
export class SessionTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  userId!: string

  @Column()
  refreshTokenHash!: string

  @Column()
  expiresAt!: Date

  @Column({ nullable: true })
  ipAddress?: string

  @Column({ nullable: true })
  userAgent?: string

  @Column({ default: true })
  isValid!: boolean

  @CreateDateColumn()
  createdAt!: Date
}
