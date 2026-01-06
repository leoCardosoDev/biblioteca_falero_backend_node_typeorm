import { Controller, HttpRequest, HttpResponse } from '@/presentation/protocols'
import { ok, serverError, badRequest, notFound } from '@/presentation/helpers/http-helper'
import { LoadAddressByZipCode } from '@/domain/usecases/load-address-by-zip-code'
import { z } from 'zod'

export class LoadAddressByZipCodeController implements Controller {
  constructor(private readonly loadAddressByZipCode: LoadAddressByZipCode) { }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const schema = z.object({
        zipCode: z.string().min(8)
      })

      const validation = schema.safeParse(request.params)
      if (!validation.success) {
        return badRequest(validation.error)
      }

      const { zipCode } = validation.data

      const address = await this.loadAddressByZipCode.load(zipCode)
      if (!address) {
        return notFound(new Error('Address not found'))
      }

      return ok(address)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
