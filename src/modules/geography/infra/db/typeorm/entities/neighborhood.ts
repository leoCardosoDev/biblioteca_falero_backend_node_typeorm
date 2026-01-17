import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique, CreateDateColumn } from 'typeorm'
import { CityTypeOrmEntity } from './city'

@Entity('neighborhood')
@Unique(['name', 'city_id'])
export class NeighborhoodTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 255 })
  name!: string

  @Column({ type: 'uuid' })
  city_id!: string

  @ManyToOne(() => CityTypeOrmEntity)
  @JoinColumn({ name: 'city_id' })
  city!: CityTypeOrmEntity

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date
}
