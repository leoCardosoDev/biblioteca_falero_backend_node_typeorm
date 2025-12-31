import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, CreateDateColumn } from 'typeorm'
import { City } from './city'

@Entity('neighborhood')
@Unique(['name', 'city_id'])
export class Neighborhood {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 255 })
  name!: string

  @Column({ type: 'uuid' })
  city_id!: string

  @ManyToOne(() => City)
  @JoinColumn({ name: 'city_id' })
  city!: City

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
