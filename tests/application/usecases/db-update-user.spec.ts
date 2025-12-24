import { DbUpdateUser } from '@/application/usecases/db-update-user'
import { UpdateUserParams } from '@/domain/usecases/update-user'
import { UserModel } from '@/domain/models/user'
import { UpdateUserRepository } from '@/application/protocols/db/update-user-repository'
import { Id } from '@/domain/value-objects/id'
import { Email } from '@/domain/value-objects/email'
import { Cpf } from '@/domain/value-objects/cpf'

const makeFakeUser = (): UserModel => ({
  id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
  name: 'any_name',
  email: Email.create('any_email@mail.com'),
  rg: 'any_rg',
  cpf: Cpf.create('529.982.247-25'),
  dataNascimento: 'any_date'
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
      name: 'updated_name'
    }
    await sut.update(userData)
    expect(updateSpy).toHaveBeenCalledWith(userData)
  })

  test('Should throw if UpdateUserRepository throws', async () => {
    const { sut, updateUserRepositoryStub } = makeSut()
    jest.spyOn(updateUserRepositoryStub, 'update').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.update({
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: 'updated_name'
    })
    await expect(promise).rejects.toThrow()
  })

  test('Should return an updated user on success', async () => {
    const { sut } = makeSut()
    const userData = {
      id: Id.create('550e8400-e29b-41d4-a716-446655440000'),
      name: 'updated_name'
    }
    const user = await sut.update(userData)
    expect(user.id.value).toBe('550e8400-e29b-41d4-a716-446655440000')
    expect(user.name).toBe('any_name')
  })
})
