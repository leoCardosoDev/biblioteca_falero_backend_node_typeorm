import { AddUser, AddUserParams } from '@/modules/identity/application/usecases/add-user'
import { AddUserOutput } from '@/modules/identity/application/usecases/add-user-output'
import { User } from '@/modules/identity/domain/entities/user'
import { AddUserRepository } from '@/modules/identity/application/protocols/add-user-repository'
import { LoadUserByEmailRepository } from '@/modules/identity/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/modules/identity/application/protocols/db/load-user-by-cpf-repository'
import { EmailInUseError } from '@/modules/identity/domain/errors/email-in-use-error'
import { CpfInUseError } from '@/modules/identity/domain/errors/cpf-in-use-error'
import { DomainEvents, SaveDomainEventRepository } from '@/shared/domain/events/domain-events'
import { ResolveAddress } from '@/modules/geography/application/usecases/resolve-address'
import { Address } from '@/modules/identity/domain/value-objects/address'
import { IdGenerator } from '@/shared/application/gateways'
import { Id } from '@/shared/domain/value-objects/id'

export class DbAddUser implements AddUser {
  constructor(
    private readonly addUserRepository: AddUserRepository,
    private readonly loadUserByEmailRepository: LoadUserByEmailRepository,
    private readonly loadUserByCpfRepository: LoadUserByCpfRepository,
    private readonly saveDomainEventRepository: SaveDomainEventRepository,
    private readonly resolveAddress: ResolveAddress,
    private readonly idGenerator: IdGenerator
  ) { }

  async add(userData: AddUserParams): Promise<AddUserOutput | Error> {
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
      const addressOrError = await this.resolveAddress.resolve(userData.address)
      if (addressOrError.isLeft()) {
        return addressOrError.value
      }
      addressVO = addressOrError.value
    }

    const id = this.idGenerator.generate()
    const idVO = Id.create(id)

    const user = User.create({
      id: idVO,
      name: userData.name,
      email: userData.email,
      rg: userData.rg,
      cpf: userData.cpf,
      gender: userData.gender,
      phone: userData.phone,
      address: addressVO,
      status: userData.status
    })

    await this.addUserRepository.add(user)

    await DomainEvents.dispatchEventsForAggregate(user.id.value, this.saveDomainEventRepository)

    return {
      id: user.id.value,
      name: user.name.value,
      email: user.email.value,
      cpf: user.cpf.value,
      role: user.login?.role.value || 'USER',
      status: user.status.value
    }
  }
}
