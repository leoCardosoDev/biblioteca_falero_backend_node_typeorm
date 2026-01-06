import { AddUser, AddUserParams, AddUserRepoParams } from '@/domain/usecases/add-user'
import { UserModel } from '@/domain/models/user'
import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { LoadUserByEmailRepository } from '@/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/application/protocols/db/load-user-by-cpf-repository'
import { EmailInUseError, CpfInUseError } from '@/domain/errors'
import { DomainEvents, SaveDomainEventRepository } from '@/domain/events/domain-events'
import { GetOrCreateGeoEntityService } from '@/domain/services/geo/get-or-create-geo-entity-service'
import { Address } from '@/domain/value-objects/address'

export class DbAddUser implements AddUser {
  constructor(
    private readonly addUserRepository: AddUserRepository,
    private readonly loadUserByEmailRepository: LoadUserByEmailRepository,
    private readonly loadUserByCpfRepository: LoadUserByCpfRepository,
    private readonly saveDomainEventRepository: SaveDomainEventRepository,
    private readonly getOrCreateGeoEntityService: GetOrCreateGeoEntityService
  ) { }

  async add(userData: AddUserParams): Promise<UserModel | Error> {
    const userByEmail = await this.loadUserByEmailRepository.loadByEmail(userData.email.value)
    if (userByEmail) {
      return new EmailInUseError()
    }
    const userByCpf = await this.loadUserByCpfRepository.loadByCpf(userData.cpf.value)
    if (userByCpf) {
      return new CpfInUseError()
    }

    let addressVO: Address | undefined

    if (userData.address) {
      let { cityId, neighborhoodId } = userData.address

      if ((!cityId || !neighborhoodId) && userData.address.city && userData.address.neighborhood && userData.address.state) {
        const geoIds = await this.getOrCreateGeoEntityService.perform({
          uf: userData.address.state,
          city: userData.address.city,
          neighborhood: userData.address.neighborhood
        })
        cityId = geoIds.cityId
        neighborhoodId = geoIds.neighborhoodId
      }

      const addressOrError = Address.create({
        street: userData.address.street,
        number: userData.address.number,
        complement: userData.address.complement,
        zipCode: userData.address.zipCode,
        cityId: cityId || '',
        neighborhoodId: neighborhoodId || ''
      })

      if (addressOrError instanceof Error) {
        return addressOrError
      }
      addressVO = addressOrError
    }

    const repoInitData: AddUserRepoParams = {
      ...userData,
      address: addressVO
    }

    const user = await this.addUserRepository.add(repoInitData)

    DomainEvents.markAggregateForDispatch(user.id.value, {
      aggregateId: user.id.value,
      type: 'UserCreated',
      payload: {
        userId: user.id.value,
        email: user.email.value
      },
      createdAt: new Date()
    })

    await DomainEvents.dispatchEventsForAggregate(user.id.value, this.saveDomainEventRepository)

    return user
  }
}
