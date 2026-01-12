import { Controller, HttpRequest, HttpResponse, Validation } from '@/presentation/protocols'
import { ok, serverError, badRequest } from '@/presentation/helpers/http-helper'
import { AddNeighborhood } from '@/domain/usecases/add-neighborhood'

export class AddNeighborhoodController implements Controller {
  constructor(
    private readonly addNeighborhood: AddNeighborhood,
    private readonly validation: Validation
  ) { }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(request.body)
      if (error) {
        return badRequest(error)
      }
      type AddNeighborhoodBody = {
        name: string
        city_id: string
      }
      const { name, city_id } = request.body as AddNeighborhoodBody
      const neighborhood = await this.addNeighborhood.add({
        name,
        cityId: city_id
      })
      return ok(neighborhood)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
