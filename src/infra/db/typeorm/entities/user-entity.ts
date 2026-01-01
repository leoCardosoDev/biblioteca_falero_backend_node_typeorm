import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm'

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

  @Column({ name: 'address_neighborhood_id', nullable: true })
  addressNeighborhoodId?: string

  @Column({ name: 'address_city_id', nullable: true })
  addressCityId?: string

  @Column({ name: 'address_zip_code', nullable: true })
  addressZipCode?: string
}
