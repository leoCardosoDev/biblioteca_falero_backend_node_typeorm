import { DbUpdateUser } from '@/modules/identity/application/usecases/db-update-user'
import { UpdateUserParams } from '@/modules/identity/application/usecases/update-user'
import { UserModel } from '@/modules/identity/domain/entities/user'
import { UpdateUserRepository } from '@/modules/identity/application/protocols/db/update-user-repository'
import { Id } from '@/shared/domain/value-objects/id'
import { Email } from '@/modules/identity/domain/value-objects/email'
import { Cpf } from '@/modules/identity/domain/value-objects/cpf'
import { Name } from '@/modules/identity/domain/value-objects/name'
import { Rg } from '@/modules/identity/domain/value-objects/rg'
// removed BirthDate import

const makeFakeUser = (): UserModel => ({
  id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
  name: Name.create('any_name') as Name,
  email: Email.create('any_email@mail.com'),
  rg: Rg.create('123456789') as Rg,
  cpf: Cpf.create('529.982.247-25'),
  gender: 'male'
})

const makeUpdateUserRepository = (): UpdateUserRepository => {
  class UpdateUserRepositoryStub implements UpdateUserRepository {
    async update(_userData: UpdateUserParams): Promise<UserModel> {
      return await new Promise(resolve => resolve(makeFakeUser()))
    }
  }
  return new UpdateUserRepositoryStub()
}

interface SutTypes {
  sut: DbUpdateUser
  updateUserRepositoryStub: UpdateUserRepository
}

const makeSut = (): SutTypes => {
  const updateUserRepositoryStub = makeUpdateUserRepository()
  const sut = new DbUpdateUser(updateUserRepositoryStub)
  return {
    sut,
    updateUserRepositoryStub
  }
}

describe('DbUpdateUser UseCase', () => {
  test('Should call UpdateUserRepository with correct values', async () => {
    const { sut, updateUserRepositoryStub } = makeSut()
    const updateSpy = jest.spyOn(updateUserRepositoryStub, 'update')
    const userData = {
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: Name.create('updated_name') as Name
    }
    await sut.update(userData)
    expect(updateSpy).toHaveBeenCalledWith(userData)
  })

  test('Should throw if UpdateUserRepository throws', async () => {
    const { sut, updateUserRepositoryStub } = makeSut()
    jest.spyOn(updateUserRepositoryStub, 'update').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.update({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: Name.create('updated_name') as Name
    })
    await expect(promise).rejects.toThrow()
  })

  test('Should return an updated user on success', async () => {
    const { sut } = makeSut()
    const userData = {
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: Name.create('updated_name') as Name
    }
    const user = await sut.update(userData)
    expect(user).toBeTruthy()
    expect(user!.id.value).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(user!.name.value).toBe('any_name')
  })
})
