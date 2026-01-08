import { Id } from '@/domain/value-objects/id'
import { AddUser, AddUserParams } from '@/domain/usecases/add-user'
import { User } from '@/domain/models/user'
import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { LoadUserByEmailRepository } from '@/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/application/protocols/db/load-user-by-cpf-repository'
import { EmailInUseError } from '@/domain/errors/email-in-use-error'
import { CpfInUseError } from '@/domain/errors/cpf-in-use-error'
import { DomainEvents, SaveDomainEventRepository } from '@/domain/events/domain-events'
import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { Address } from '@/domain/value-objects/address'
import { Name } from '@/domain/value-objects/name'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Rg } from '@/domain/value-objects/rg'
import { UserStatus } from '@/domain/value-objects/user-status'

type AddressParams = AddUserParams['address']

export class DbAddUser implements AddUser {
  constructor(
    private readonly addUserRepository: AddUserRepository,
    private readonly loadUserByEmailRepository: LoadUserByEmailRepository,
    private readonly loadUserByCpfRepository: LoadUserByCpfRepository,
    private readonly saveDomainEventRepository: SaveDomainEventRepository,
    private readonly getOrCreateGeoEntityService: GetOrCreateGeoEntityService
  ) { }

  async add(userData: AddUserParams): Promise<User | Error> {
    const nameOrError = Name.create(userData.name)
    if (nameOrError instanceof Error) {
      return nameOrError
    }

    let emailOrError: Email | Error
    try {
      emailOrError = Email.create(userData.email)
    } catch (error) {
      return error as Error
    }

    const rgOrError = Rg.create(userData.rg)
    if (rgOrError instanceof Error) {
      return rgOrError
    }

    let cpfOrError: Cpf | Error
    try {
      cpfOrError = Cpf.create(userData.cpf)
    } catch (error) {
      return error as Error
    }

    const statusOrError = UserStatus.create(userData.status || 'ACTIVE')
    if (statusOrError instanceof Error) {
      return statusOrError
    }

    const userByEmail = await this.loadUserByEmailRepository.loadByEmail((emailOrError as Email).value)
    if (userByEmail) {
      return new EmailInUseError()
    }
    const userByCpf = await this.loadUserByCpfRepository.loadByCpf((cpfOrError as Cpf).value)
    if (userByCpf) {
      return new CpfInUseError()
    }

    const addressVOOrError = await this.resolveAddress(userData.address)
    if (addressVOOrError instanceof Error) {
      return addressVOOrError
    }

    const user = User.create({
      name: nameOrError,
      email: emailOrError,
      rg: rgOrError,
      cpf: cpfOrError,
      gender: userData.gender,
      phone: userData.phone,
      address: addressVOOrError,
      status: statusOrError
    })

    await this.addUserRepository.add(user)

    await DomainEvents.dispatchEventsForAggregate(user.id.value, this.saveDomainEventRepository)

    return user
  }

  private async resolveAddress(addressData: AddressParams): Promise<Address | undefined | Error> {
    if (!addressData) {
      return undefined
    }

    // Initialize with values from input (strings)
    let cityIdResult: Id | undefined
    let neighborhoodIdResult: Id | undefined
    let stateIdResult: Id | undefined

    // Try to convert input strings to Ids
    if (typeof addressData.cityId === 'string') {
      cityIdResult = Id.create(addressData.cityId)
    } else {
      cityIdResult = addressData.cityId
    }

    if (typeof addressData.neighborhoodId === 'string') {
      neighborhoodIdResult = Id.create(addressData.neighborhoodId)
    } else {
      neighborhoodIdResult = addressData.neighborhoodId
    }

    if (typeof addressData.stateId === 'string') {
      stateIdResult = Id.create(addressData.stateId)
    } else {
      stateIdResult = addressData.stateId
    }

    if (this.shouldLookUpGeoEntities(addressData)) {
      const geoIds = await this.getOrCreateGeoEntityService.perform({
        uf: addressData.state!,
        city: addressData.city!,
        neighborhood: addressData.neighborhood!
      })
      cityIdResult = geoIds.cityId
      neighborhoodIdResult = geoIds.neighborhoodId
      stateIdResult = geoIds.stateId
    }

    if (!cityIdResult || !neighborhoodIdResult || !stateIdResult) {
      // Allow domain validation to handle missing IDs by passing explicit params
      // Casting to unknown as Id to bypass TS check BUT domain will validate
      return Address.create({
        street: addressData.street,
        number: addressData.number,
        complement: addressData.complement,
        zipCode: addressData.zipCode,
        cityId: cityIdResult as unknown as Id,
        neighborhoodId: neighborhoodIdResult as unknown as Id,
        stateId: stateIdResult as unknown as Id,
      })
    }

    return Address.create({
      street: addressData.street,
      number: addressData.number,
      complement: addressData.complement,
      zipCode: addressData.zipCode,
      cityId: cityIdResult,
      neighborhoodId: neighborhoodIdResult,
      stateId: stateIdResult,
    })
  }

  private shouldLookUpGeoEntities(address: NonNullable<AddressParams>): boolean {
    const missingIds = !address.cityId || !address.neighborhoodId
    const hasGeoNames = !!(address.city && address.neighborhood && address.state)
    return missingIds && hasGeoNames
  }
}
