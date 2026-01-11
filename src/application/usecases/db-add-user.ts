import { AddUser, AddUserParams } from '@/domain/usecases/add-user'
import { AddUserOutput } from '@/domain/usecases/add-user-output'
import { User } from '@/domain/models/user'
import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { LoadUserByEmailRepository } from '@/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/application/protocols/db/load-user-by-cpf-repository'
import { EmailInUseError } from '@/domain/errors/email-in-use-error'
import { CpfInUseError } from '@/domain/errors/cpf-in-use-error'
import { DomainEvents, SaveDomainEventRepository } from '@/domain/events/domain-events'
import { ResolveAddress } from '@/domain/usecases/resolve-address'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'
import { Name } from '@/domain/value-objects/name'
import { Rg } from '@/domain/value-objects/rg'
import { UserStatus } from '@/domain/value-objects/user-status'
import { Address } from '@/domain/value-objects/address'

export class DbAddUser implements AddUser {
  constructor(
    private readonly addUserRepository: AddUserRepository,
    private readonly loadUserByEmailRepository: LoadUserByEmailRepository,
    private readonly loadUserByCpfRepository: LoadUserByCpfRepository,
    private readonly saveDomainEventRepository: SaveDomainEventRepository,
    private readonly resolveAddress: ResolveAddress
  ) { }

  async add(userData: AddUserParams): Promise<AddUserOutput | Error> {
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

    let addressVO: Address | undefined
    if (userData.address) {
      const addressOrError = await this.resolveAddress.resolve(userData.address)
      if (addressOrError.isLeft()) {
        return addressOrError.value
      }
      addressVO = addressOrError.value
    }

    const user = User.create({
      name: nameOrError,
      email: emailOrError,
      rg: rgOrError,
      cpf: cpfOrError,
      gender: userData.gender,
      phone: userData.phone,
      address: addressVO,
      status: statusOrError
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
