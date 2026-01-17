import { DbDeleteUser } from '@/modules/identity/application/usecases/db-delete-user'
import { DeleteUserRepository } from '@/modules/identity/application/protocols/db/delete-user-repository'

const makeDeleteUserRepository = (): DeleteUserRepository => {
  class DeleteUserRepositoryStub implements DeleteUserRepository {
    async delete(_id: string): Promise<void> {
      return await new Promise(resolve => resolve())
    }
  }
  return new DeleteUserRepositoryStub()
}

interface SutTypes {
  sut: DbDeleteUser
  deleteUserRepositoryStub: DeleteUserRepository
}

const makeSut = (): SutTypes => {
  const deleteUserRepositoryStub = makeDeleteUserRepository()
  const sut = new DbDeleteUser(deleteUserRepositoryStub)
  return {
    sut,
    deleteUserRepositoryStub
  }
}

describe('DbDeleteUser UseCase', () => {
  test('Should call DeleteUserRepository with correct id', async () => {
    const { sut, deleteUserRepositoryStub } = makeSut()
    const deleteSpy = jest.spyOn(deleteUserRepositoryStub, 'delete')
    await sut.delete('any_id')
    expect(deleteSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should throw if DeleteUserRepository throws', async () => {
    const { sut, deleteUserRepositoryStub } = makeSut()
    jest.spyOn(deleteUserRepositoryStub, 'delete').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const promise = sut.delete('any_id')
    await expect(promise).rejects.toThrow()
  })
})
