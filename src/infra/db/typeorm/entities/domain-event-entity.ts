import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm'

@Entity('domain_events')
export class DomainEventTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Index()
  @Column()
  aggregate_id!: string

  @Index()
  @Column()
  type!: string

  @Column({ type: 'json' })
  payload!: unknown

  @CreateDateColumn({ name: 'created_at' })
  created_at!: Date
}
