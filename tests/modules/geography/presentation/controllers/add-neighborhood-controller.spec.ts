import { AddNeighborhood, AddNeighborhoodParams } from '@/modules/geography/domain/usecases/add-neighborhood'
import { AddNeighborhoodController } from '@/modules/geography/presentation/controllers/add-neighborhood-controller'
import { randomUUID } from 'crypto'
import { HttpRequest } from '@/modules/geography/presentation/protocols'
import { NeighborhoodModel } from '@/modules/geography/domain/models/neighborhood'
import { Id } from '@/shared/domain/value-objects/id'
import { Validation } from '@/shared/presentation/protocols'

const makeAddNeighborhood = (): AddNeighborhood => {
  class AddNeighborhoodStub implements AddNeighborhood {
    async add(params: AddNeighborhoodParams): Promise<NeighborhoodModel> {
      return {
        id: Id.create(randomUUID()),
        name: params.name,
        cityId: Id.create(params.cityId)
      }
    }
  }
  return new AddNeighborhoodStub()
}

const makeValidation = (): Validation => {
  class ValidationStub implements Validation {
    validate(_input: unknown): Error | undefined {
      return undefined
    }
  }
  return new ValidationStub()
}

interface SutTypes {
  sut: AddNeighborhoodController
  addNeighborhoodStub: AddNeighborhood
  validationStub: Validation
}

const makeSut = (): SutTypes => {
  const addNeighborhoodStub = makeAddNeighborhood()
  const validationStub = makeValidation()
  const sut = new AddNeighborhoodController(validationStub, addNeighborhoodStub)
  return {
    sut,
    addNeighborhoodStub,
    validationStub
  }
}

interface SuccessResponseBody {
  id: string
  name: string
  cityId: string
}

describe('AddNeighborhood Controller', () => {
  test('Should return 400 if validation fails', async () => {
    const { sut, validationStub } = makeSut()
    jest.spyOn(validationStub, 'validate').mockReturnValueOnce(new Error())
    const httpRequest: HttpRequest = {
      body: {
        name: '',
        city_id: 'invalid_uuid'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect(httpResponse.body).toBeInstanceOf(Error)
  })

  test('Should call AddNeighborhood with correct values', async () => {
    const { sut, addNeighborhoodStub } = makeSut()
    const addSpy = jest.spyOn(addNeighborhoodStub, 'add')
    const httpRequest: HttpRequest = {
      body: {
        name: 'Vila Mariana',
        city_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      }
    }
    await sut.handle(httpRequest)
    expect(addSpy).toHaveBeenCalledWith({
      name: 'Vila Mariana',
      cityId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
    })
  })

  test('Should return 500 if AddNeighborhood throws', async () => {
    const { sut, addNeighborhoodStub } = makeSut()
    jest.spyOn(addNeighborhoodStub, 'add').mockImplementationOnce(async () => {
      throw new Error()
    })
    const httpRequest: HttpRequest = {
      body: {
        name: 'Vila Mariana',
        city_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(500)
    expect((httpResponse.body as Error).message).toBe('Internal server error')
  })

  test('Should return 200 on success', async () => {
    const { sut } = makeSut()
    const httpRequest: HttpRequest = {
      body: {
        name: 'Vila Mariana',
        city_id: 'f47ac10b-58cc-4372-a567-0e02b2c3d479'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(200)
    expect((httpResponse.body as SuccessResponseBody).name).toBe('Vila Mariana')
  })
})
