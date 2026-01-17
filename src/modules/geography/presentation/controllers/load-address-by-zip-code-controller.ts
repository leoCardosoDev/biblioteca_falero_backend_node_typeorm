import { Controller, HttpRequest, HttpResponse } from '@/shared/presentation/protocols'
import { ok, serverError, notFound, badRequest } from '@/shared/presentation/helpers/http-helper'
import { Validation } from '@/shared/presentation/protocols'
import { LoadAddressByZipCode } from '@/modules/geography/domain/usecases/load-address-by-zip-code'

export class LoadAddressByZipCodeController implements Controller {
  constructor(
    private readonly loadAddressByZipCode: LoadAddressByZipCode,
    private readonly validation: Validation
  ) { }

  async handle(httpRequest: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(httpRequest.params)
      if (error) {
        return badRequest(error)
      }
      const { zipCode } = httpRequest.params as { zipCode: string }
      const result = await this.loadAddressByZipCode.load(zipCode)
      if (result.isLeft()) {
        return notFound(result.value)
      }
      return ok(result.value)
    } catch (error) {
      return serverError(error as Error)
    }
  }
}
