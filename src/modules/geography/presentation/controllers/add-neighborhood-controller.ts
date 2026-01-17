import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { ok, serverError, badRequest } from '@/shared/presentation/helpers/http-helper'
import { Validation } from '@/shared/presentation/protocols/validation'
import { AddNeighborhood } from '@/modules/geography/application/usecases/add-neighborhood'

export class AddNeighborhoodController implements Controller {
  constructor(
    private readonly validation: Validation,
    private readonly addNeighborhood: AddNeighborhood
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.body)
      if (error) {
        return badRequest(error)
      }
      const { name, city_id } = httpRequest.body as { name: string; city_id: string }
      const result = await this.addNeighborhood.add({ name, cityId: city_id })
      return ok(result)
    } catch (error) {
      console.log('AddNeighborhoodController caught error:', error)
      return serverError(error as Error)
    }
  }
}
