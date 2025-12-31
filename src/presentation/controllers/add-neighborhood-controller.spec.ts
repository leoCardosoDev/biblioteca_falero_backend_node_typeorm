import { AddNeighborhood, AddNeighborhoodParams } from '@/domain/usecases/add-neighborhood'
import { AddNeighborhoodController } from './add-neighborhood-controller'
import { HttpRequest } from '@/presentation/protocols'
import { NeighborhoodModel } from '@/domain/models/neighborhood'
import { Id } from '@/domain/value-objects/id'

const makeAddNeighborhood = (): AddNeighborhood => {
  class AddNeighborhoodStub implements AddNeighborhood {
    async add(params: AddNeighborhoodParams): Promise<NeighborhoodModel> {
      return {
        id: Id.generate(),
        name: params.name,
        cityId: Id.create(params.cityId)
      }
    }
  }
  return new AddNeighborhoodStub()
}

interface SutTypes {
  sut: AddNeighborhoodController
  addNeighborhoodStub: AddNeighborhood
}

const makeSut = (): SutTypes => {
  const addNeighborhoodStub = makeAddNeighborhood()
  const sut = new AddNeighborhoodController(addNeighborhoodStub)
  return {
    sut,
    addNeighborhoodStub
  }
}

interface ErrorResponseBody {
  error: {
    code: string
  }
}

interface SuccessResponseBody {
  id: string
  name: string
  cityId: string
}

describe('AddNeighborhood Controller', () => {
  test('Should return 400 if validation fails', async () => {
    const { sut } = makeSut()
    const httpRequest: HttpRequest = {
      body: {
        name: '',
        city_id: 'invalid_uuid'
      }
    }
    const httpResponse = await sut.handle(httpRequest)
    expect(httpResponse.statusCode).toBe(400)
    expect((httpResponse.body as ErrorResponseBody).error).toHaveProperty('code', 'BAD_REQUEST')
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
    expect((httpResponse.body as ErrorResponseBody).error).toHaveProperty('code', 'INTERNAL_ERROR')
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
