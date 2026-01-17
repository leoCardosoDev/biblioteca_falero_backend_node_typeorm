import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { ok, serverError, badRequest } from '@/shared/presentation/helpers/http-helper'
import { LoadNeighborhoodById } from '@/modules/geography/domain/usecases/load-neighborhood-by-id'

export class LoadNeighborhoodByIdController implements Controller {
  constructor(private readonly loadNeighborhoodById: LoadNeighborhoodById) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id } = httpRequest.params as { id: string }
      const neighborhood = await this.loadNeighborhoodById.load(id)
      if (!neighborhood) {
        return badRequest(new Error('Neighborhood not found'))
      }
      return ok(neighborhood)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
