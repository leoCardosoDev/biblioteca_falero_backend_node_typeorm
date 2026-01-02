import { DeleteUserController } from '@/presentation/controllers/user/delete-user-controller'
import { DeleteUser } from '@/domain/usecases/delete-user'
import { MissingParamError, ServerError } from '@/presentation/errors'

const makeDeleteUser = (): DeleteUser => {
  class DeleteUserStub implements DeleteUser {
    async delete(_id: string): Promise<void> {
      return await new Promise(resolve => resolve())
    }
  }
  return new DeleteUserStub()
}

interface SutTypes {
  sut: DeleteUserController
  deleteUserStub: DeleteUser
}

const makeSut = (): SutTypes => {
  const deleteUserStub = makeDeleteUser()
  const sut = new DeleteUserController(deleteUserStub)
  return {
    sut,
    deleteUserStub
  }
}

describe('DeleteUser Controller', () => {
  test('Should return 400 if no id is provided', async () => {
    const { sut } = makeSut()
    const httpResponse = await sut.handle({}) as { statusCode: number; body: { error: { code: string } } }
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toEqual(new MissingParamError('id'))
  })

  test('Should call DeleteUser with correct id', async () => {
    const { sut, deleteUserStub } = makeSut()
    const deleteSpy = jest.spyOn(deleteUserStub, 'delete')
    const httpRequest = {
      params: { id: 'any_id' }
    }
    await sut.handle(httpRequest)
    expect(deleteSpy).toHaveBeenCalledWith('any_id')
  })

  test('Should return 204 on success', async () => {
    const { sut } = makeSut()
    const httpRequest = {
      params: { id: 'any_id' }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(204)
  })

  test('Should return 500 if DeleteUser throws', async () => {
    const { sut, deleteUserStub } = makeSut()
    jest.spyOn(deleteUserStub, 'delete').mockReturnValueOnce(new Promise((resolve, reject) => reject(new Error())))
    const httpRequest = {
      params: { id: 'any_id' }
    }
    const httpResponse = await sut.handle(httpRequest) as { statusCode: number; body: { error: { code: string } } }
    expect(httpResponse.statusCode).toBe(500)
    expect(httpResponse.body).toBeInstanceOf(ServerError)
  })
})
