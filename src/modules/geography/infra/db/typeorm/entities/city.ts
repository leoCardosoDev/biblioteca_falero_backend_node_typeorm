import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, CreateDateColumn } from 'typeorm'
import { StateTypeOrmEntity } from './state'

@Entity('city')
@Unique(['name', 'state_id'])
export class CityTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 255 })
  name!: string

  @Column()
  state_id!: string

  @ManyToOne(() => StateTypeOrmEntity)
  @JoinColumn({ name: 'state_id' })
  state!: StateTypeOrmEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
