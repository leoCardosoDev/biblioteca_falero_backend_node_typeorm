import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm'
import { State } from './state'

@Entity('city')
@Unique(['name', 'state_id'])
export class City {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column({ length: 255 })
  name!: string

  @Column()
  state_id!: string



  @ManyToOne(() => State)
  @JoinColumn({ name: 'state_id' })
  state!: State
}
