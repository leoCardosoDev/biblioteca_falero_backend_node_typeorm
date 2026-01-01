import { AddUser, AddUserParams } from '@/domain/usecases/add-user'
import { UserModel } from '@/domain/models/user'
import { AddUserRepository } from '@/application/protocols/add-user-repository'
import { LoadUserByEmailRepository } from '@/application/protocols/db/load-user-by-email-repository'
import { LoadUserByCpfRepository } from '@/application/protocols/db/load-user-by-cpf-repository'
import { EmailInUseError, CpfInUseError } from '@/domain/errors'
import { DomainEvents, SaveDomainEventRepository } from '@/domain/events/domain-events'

export class DbAddUser implements AddUser {
  constructor(
    private readonly addUserRepository: AddUserRepository,
    private readonly loadUserByEmailRepository: LoadUserByEmailRepository,
    private readonly loadUserByCpfRepository: LoadUserByCpfRepository,
    private readonly saveDomainEventRepository: SaveDomainEventRepository
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
    const user = await this.addUserRepository.add(userData)

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
