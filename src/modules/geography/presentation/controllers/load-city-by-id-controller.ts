import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { ok, serverError, badRequest } from '@/shared/presentation/helpers/http-helper'
import { LoadCityById } from '@/modules/geography/application/usecases/load-city-by-id'

export class LoadCityByIdController implements Controller {
  constructor(private readonly loadCityById: LoadCityById) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id } = httpRequest.params as { id: string }
      const city = await this.loadCityById.load(id)
      if (!city) {
        return badRequest(new Error('City not found'))
      }
      return ok(city)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
