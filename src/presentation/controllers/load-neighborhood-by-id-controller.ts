import { Controller, HttpRequest, HttpResponse, notFound, ok, serverError, NotFoundError } from '@/presentation'
import { LoadNeighborhoodById } from '@/domain/usecases/load-neighborhood-by-id'

export class LoadNeighborhoodByIdController implements Controller {
  constructor(private readonly loadNeighborhoodById: LoadNeighborhoodById) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const { id } = httpRequest.params as { id: string }
      const neighborhood = await this.loadNeighborhoodById.load(id)
      if (!neighborhood) {
        return notFound(new NotFoundError('Neighborhood'))
      }
      return ok({
        id: neighborhood.id.value,
        name: neighborhood.name,
        cityId: neighborhood.cityId.value
      })
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
