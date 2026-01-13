
import { ManageUserAccessController } from '@/presentation/controllers/manage-user-access-controller'
import { ManageUserAccess, ManageUserAccessParams, ManageUserAccessResult } from '@/domain/usecases'
import { AccessDeniedError, NotFoundError, InvalidUserStatusError } from '@/domain/errors'
import { UserStatus } from '@/domain/value-objects/user-status'
import { HttpRequest } from '@/presentation/protocols/http'
import { badRequest, forbidden, noContent, notFound, serverError } from '@/presentation/helpers'
import { left, right } from '@/shared/either'

const makeFakeRequest = (): HttpRequest => ({
  userId: '00000000-0000-0000-0000-000000000001',
  body: {
    role: 'any_role',
    status: 'ACTIVE',
    password: 'any_password'
  },
  params: {
    id: '00000000-0000-0000-0000-000000000002'
  }
})

const makeManageUserAccess = (): ManageUserAccess => {
  class ManageUserAccessStub implements ManageUserAccess {
    async perform(_params: ManageUserAccessParams): Promise<ManageUserAccessResult> {
      return Promise.resolve(right(undefined))
    }
  }
  return new ManageUserAccessStub()
}

interface SutTypes {
  sut: ManageUserAccessController
  manageUserAccessStub: ManageUserAccess
}

const makeSut = (): SutTypes => {
  const manageUserAccessStub = makeManageUserAccess()
  const sut = new ManageUserAccessController(manageUserAccessStub)
  return {
    sut,
    manageUserAccessStub
  }
}

describe('ManageUserAccessController', () => {
  it('should call ManageUserAccess with correct values', async () => {
    const { sut, manageUserAccessStub } = makeSut()
    const performSpy = jest.spyOn(manageUserAccessStub, 'perform')
    const request = makeFakeRequest()
    await sut.handle(request)
    expect(performSpy).toHaveBeenCalledWith({
      actorId: '00000000-0000-0000-0000-000000000001',
      targetId: '00000000-0000-0000-0000-000000000002',
      roleSlug: 'any_role',
      status: UserStatus.create('ACTIVE') as UserStatus,
      password: 'any_password'
    })
  })

  it('should call ManageUserAccess with undefined status if status is not provided', async () => {
    const { sut, manageUserAccessStub } = makeSut()
    const performSpy = jest.spyOn(manageUserAccessStub, 'perform')
    const request = makeFakeRequest()
    request.body = {
      role: 'any_role',
      password: 'any_password'
    }
    await sut.handle(request)
    expect(performSpy).toHaveBeenCalledWith({
      actorId: '00000000-0000-0000-0000-000000000001',
      targetId: '00000000-0000-0000-0000-000000000002',
      roleSlug: 'any_role',
      status: undefined,
      password: 'any_password'
    })
  })

  it('should return 400 if UserStatus.create returns an error', async () => {
    const { sut } = makeSut()
    const request = makeFakeRequest()
    request.body = {
      role: 'any_role',
      status: 'INVALID_STATUS',
      password: 'any_password'
    }
    const result = await sut.handle(request)
    expect(result).toEqual(badRequest(new InvalidUserStatusError()))
  })

  it('should return 403 if ManageUserAccess returns AccessDeniedError', async () => {
    const { sut, manageUserAccessStub } = makeSut()
    jest.spyOn(manageUserAccessStub, 'perform').mockReturnValueOnce(Promise.resolve(left(new AccessDeniedError())))
    const result = await sut.handle(makeFakeRequest())
    expect(result).toEqual(forbidden(new AccessDeniedError()))
  })

  it('should return 404 if ManageUserAccess returns NotFoundError', async () => {
    const { sut, manageUserAccessStub } = makeSut()
    jest.spyOn(manageUserAccessStub, 'perform').mockReturnValueOnce(Promise.resolve(left(new NotFoundError('any_resource'))))
    const result = await sut.handle(makeFakeRequest())
    expect(result).toEqual(notFound(new NotFoundError('any_resource')))
  })

  it('should return 400 if ManageUserAccess returns a generic Error', async () => {
    const { sut, manageUserAccessStub } = makeSut()
    const error = new Error('any_error')
    jest.spyOn(manageUserAccessStub, 'perform').mockReturnValueOnce(Promise.resolve(left(error)))
    const result = await sut.handle(makeFakeRequest())
    expect(result).toEqual(badRequest(error))
  })

  it('should return 500 if ManageUserAccess throws', async () => {
    const { sut, manageUserAccessStub } = makeSut()
    jest.spyOn(manageUserAccessStub, 'perform').mockImplementationOnce(() => {
      throw new Error()
    })
    const result = await sut.handle(makeFakeRequest())
    expect(result).toEqual(serverError(new Error()))
  })

  it('should return 204 on success', async () => {
    const { sut } = makeSut()
    const result = await sut.handle(makeFakeRequest())
    expect(result).toEqual(noContent())
  })
})
