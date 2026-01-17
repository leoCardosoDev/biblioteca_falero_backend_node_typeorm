import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, VersionColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm'
import { StateTypeOrmEntity, CityTypeOrmEntity, NeighborhoodTypeOrmEntity } from '@/modules/geography/infra/db/typeorm/entities'
import type { LoginTypeOrmEntity } from './login-entity'

export const dateTransformer = {
  to: (value: string) => value,
  from: (value: Date | string) => {
    if (typeof value === 'string') {
      return value
    }
    return value.toISOString().split('T')[0]
  }
}

@Entity('users')
export class UserTypeOrmEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string

  @Column()
  name!: string

  @Column({ unique: true })
  email!: string

  @Column()
  rg!: string

  @Column({ unique: true })
  cpf!: string

  @Column()
  gender!: string

  @Column({ nullable: true })
  phone?: string

  @Column({ name: 'address_street', nullable: true })
  addressStreet?: string

  @Column({ name: 'address_number', nullable: true })
  addressNumber?: string

  @Column({ name: 'address_complement', nullable: true })
  addressComplement?: string

  @Column({ name: 'address_state_id', nullable: true })
  addressStateId?: string

  @Column({ name: 'address_neighborhood_id', nullable: true })
  addressNeighborhoodId?: string

  @Column({ name: 'address_city_id', nullable: true })
  addressCityId?: string

  @Column({ name: 'address_zip_code', nullable: true })
  addressZipCode?: string

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date

  @Column({ type: 'datetime', nullable: true, name: 'deleted_at' })
  deletedAt?: Date

  @Column({ type: 'varchar', length: 20, default: 'INACTIVE' })
  status!: string

  @VersionColumn()
  version!: number

  @OneToMany('LoginTypeOrmEntity', (login: LoginTypeOrmEntity) => login.user)
  logins?: LoginTypeOrmEntity[]

  @ManyToOne(() => StateTypeOrmEntity)
  @JoinColumn({ name: 'address_state_id' })
  addressState?: StateTypeOrmEntity

  @ManyToOne(() => CityTypeOrmEntity)
  @JoinColumn({ name: 'address_city_id' })
  addressCity?: CityTypeOrmEntity

  @ManyToOne(() => NeighborhoodTypeOrmEntity)
  @JoinColumn({ name: 'address_neighborhood_id' })
  addressNeighborhood?: NeighborhoodTypeOrmEntity
}
