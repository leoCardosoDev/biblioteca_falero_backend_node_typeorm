
import { UpdateUserStatusController, UpdateUserRoleController } from '@/presentation/controllers/user/user-governance-controller'
import { BlockUser, BlockUserResult } from '@/domain/usecases/block-user'
import { PromoteUser, PromoteUserResult } from '@/domain/usecases/promote-user'
import { Validation } from '@/presentation/protocols/validation'
import { HttpRequest } from '@/presentation/protocols'
import { badRequest, noContent, serverError, forbidden } from '@/presentation/helpers/http-helper'
import { MissingParamError } from '@/presentation/errors/missing-param-error'
import { InvalidParamError } from '@/presentation/errors/invalid-param-error'
import { AccessDeniedError } from '@/domain/errors/access-denied-error'
import { right, left } from '@/shared/either'

const makeBlockUser = (): BlockUser => {
  class BlockUserStub implements BlockUser {
    async block(_actorId: string, _targetId: string): Promise<BlockUserResult> {
      return Promise.resolve(right(undefined))
    }
  }
  return new BlockUserStub()
}

const makePromoteUser = (): PromoteUser => {
  class PromoteUserStub implements PromoteUser {
    async promote(_actorId: string, _targetId: string, _newRoleId: string): Promise<PromoteUserResult> {
      return Promise.resolve(right(undefined))
    }
  }
  return new PromoteUserStub()
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate(_input: Record<string, unknown>): Error | undefined {
      return undefined
    }
  }
  return new ValidationStub()
}

interface SutTypesStatus {
  sut: UpdateUserStatusController
  blockUserStub: BlockUser
  validationStub: Validation
}

const makeSutStatus = (): SutTypesStatus => {
  const blockUserStub = makeBlockUser()
  const validationStub = makeValidation()
  const sut = new UpdateUserStatusController(validationStub, blockUserStub)
  return {
    sut,
    blockUserStub,
    validationStub
  }
}

interface SutTypesRole {
  sut: UpdateUserRoleController
  promoteUserStub: PromoteUser
  validationStub: Validation
}

const makeSutRole = (): SutTypesRole => {
  const promoteUserStub = makePromoteUser()
  const validationStub = makeValidation()
  const sut = new UpdateUserRoleController(validationStub, promoteUserStub)
  return {
    sut,
    promoteUserStub,
    validationStub
  }
}

const makeFakeRequestStatus = (): HttpRequest => ({
  body: {
    status: 'BLOCKED'
  },
  params: {
    id: 'any_id'
  },
  userId: 'any_actor_id'
})

const makeFakeRequestRole = (): HttpRequest => ({
  body: {
    roleId: 'any_role_id'
  },
  params: {
    id: 'any_id'
  },
  userId: 'any_actor_id'
})

describe('UserGovernance Controllers', () => {
  describe('UpdateUserStatusController', () => {
    test('Should call Validation with correct values', async () => {
      const { sut, validationStub } = makeSutStatus()
      const validateSpy = jest.spyOn(validationStub, 'validate')
      const httpRequest = makeFakeRequestStatus()
      await sut.handle(httpRequest)
      expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
    })

    test('Should return 400 if Validation returns an error', async () => {
      const { sut, validationStub } = makeSutStatus()
      jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new Error())
      const httpResponse = await sut.handle(makeFakeRequestStatus())
      expect(httpResponse).toEqual(badRequest(new Error()))
    })

    test('Should return 400 if status is not provided', async () => {
      const { sut } = makeSutStatus()
      const httpResponse = await sut.handle({ ...makeFakeRequestStatus(), body: {} })
      expect(httpResponse).toEqual(badRequest(new MissingParamError('status')))
    })

    test('Should return 400 if status is invalid', async () => {
      const { sut } = makeSutStatus()
      const httpResponse = await sut.handle({
        body: { status: 'INVALID_STATUS' },
        params: { id: 'any_id' },
        userId: 'any_actor_id'
      })
      expect(httpResponse).toEqual(badRequest(new InvalidParamError('status')))
    })

    test('Should call BlockUser with correct values', async () => {
      const { sut, blockUserStub } = makeSutStatus()
      const blockSpy = jest.spyOn(blockUserStub, 'block')
      await sut.handle(makeFakeRequestStatus())
      expect(blockSpy).toHaveBeenCalledWith('any_actor_id', 'any_id')
    })

    test('Should return 400 if blockUser returns validation error', async () => {
      const { sut, blockUserStub } = makeSutStatus()
      jest.spyOn(blockUserStub, 'block').mockReturnValueOnce(Promise.resolve(left(new Error('validation_error'))))
      const httpResponse = await sut.handle(makeFakeRequestStatus())
      expect(httpResponse).toEqual(badRequest(new Error('validation_error')))
    })

    test('Should return 500 if BlockUser throws', async () => {
      const { sut, blockUserStub } = makeSutStatus()
      jest.spyOn(blockUserStub, 'block').mockImplementationOnce(() => { throw new Error() })
      const httpResponse = await sut.handle(makeFakeRequestStatus())
      expect(httpResponse).toEqual(serverError(new Error()))
    })

    test('Should return 403 if BlockUser returns AccessDeniedError', async () => {
      const { sut, blockUserStub } = makeSutStatus()
      jest.spyOn(blockUserStub, 'block').mockReturnValueOnce(Promise.resolve(left(new AccessDeniedError())))
      const httpResponse = await sut.handle(makeFakeRequestStatus())
      expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
    })

    test('Should return 204 on success', async () => {
      const { sut } = makeSutStatus()
      const httpResponse = await sut.handle(makeFakeRequestStatus())
      expect(httpResponse).toEqual(noContent())
    })
  })

  describe('UpdateUserRoleController', () => {
    test('Should call Validation with correct values', async () => {
      const { sut, validationStub } = makeSutRole()
      const validateSpy = jest.spyOn(validationStub, 'validate')
      const httpRequest = makeFakeRequestRole()
      await sut.handle(httpRequest)
      expect(validateSpy).toHaveBeenCalledWith(httpRequest.body)
    })

    test('Should return 400 if Validation returns an error', async () => {
      const { sut, validationStub } = makeSutRole()
      jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new Error())
      const httpResponse = await sut.handle(makeFakeRequestRole())
      expect(httpResponse).toEqual(badRequest(new Error()))
    })

    test('Should return 400 if roleId is not provided', async () => {
      const { sut } = makeSutRole()
      const httpResponse = await sut.handle({
        body: {},
        params: { id: 'any_id' },
        userId: 'any_actor_id'
      })
      expect(httpResponse).toEqual(badRequest(new MissingParamError('roleId')))
    })

    test('Should call PromoteUser with correct values', async () => {
      const { sut, promoteUserStub } = makeSutRole()
      const promoteSpy = jest.spyOn(promoteUserStub, 'promote')
      await sut.handle(makeFakeRequestRole())
      expect(promoteSpy).toHaveBeenCalledWith('any_actor_id', 'any_id', 'any_role_id')
    })

    test('Should return 400 if PromoteUser returns validation error', async () => {
      const { sut, promoteUserStub } = makeSutRole()
      jest.spyOn(promoteUserStub, 'promote').mockReturnValueOnce(Promise.resolve(left(new Error('validation_error'))))
      const httpResponse = await sut.handle(makeFakeRequestRole())
      expect(httpResponse).toEqual(badRequest(new Error('validation_error')))
    })

    test('Should return 500 if PromoteUser throws', async () => {
      const { sut, promoteUserStub } = makeSutRole()
      jest.spyOn(promoteUserStub, 'promote').mockImplementationOnce(() => { throw new Error() })
      const httpResponse = await sut.handle(makeFakeRequestRole())
      expect(httpResponse).toEqual(serverError(new Error()))
    })

    test('Should return 403 if PromoteUser returns AccessDeniedError', async () => {
      const { sut, promoteUserStub } = makeSutRole()
      jest.spyOn(promoteUserStub, 'promote').mockReturnValueOnce(Promise.resolve(left(new AccessDeniedError())))
      const httpResponse = await sut.handle(makeFakeRequestRole())
      expect(httpResponse).toEqual(forbidden(new AccessDeniedError()))
    })

    test('Should return 204 on success', async () => {
      const { sut } = makeSutRole()
      const httpResponse = await sut.handle(makeFakeRequestRole())
      expect(httpResponse).toEqual(noContent())
    })
  })
})
