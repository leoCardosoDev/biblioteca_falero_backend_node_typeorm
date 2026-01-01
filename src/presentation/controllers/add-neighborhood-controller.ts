import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols'
import { ok, serverError, badRequest } from '@/presentation/helpers/http-helper'
import { AddNeighborhood } from '@/domain/usecases/add-neighborhood'
import { z } from 'zod'

export class AddNeighborhoodController implements Controller {
  constructor(private readonly addNeighborhood: AddNeighborhood) { }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const schema = z.object({
        name: z.string().min(1),
        city_id: z.string().uuid()
      })

      const validation = schema.safeParse(request.body)
      if (!validation.success) {
        return badRequest(new Error(JSON.stringify(validation.error.format()))) // Simplified error for now
      }

      const { name, city_id } = validation.data

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
