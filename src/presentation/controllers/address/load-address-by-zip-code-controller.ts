import { Controller, HttpRequest, HttpResponse, Validation } from '@/presentation/protocols'
import { ok, serverError, badRequest, notFound } from '@/presentation/helpers/http-helper'
import { LoadAddressByZipCode } from '@/domain/usecases/load-address-by-zip-code'

export class LoadAddressByZipCodeController implements Controller {
  constructor(
    private readonly loadAddressByZipCode: LoadAddressByZipCode,
    private readonly validation: Validation
  ) { }

  async handle(request: HttpRequest): Promise<HttpResponse> {
    try {
      const error = this.validation.validate(request.params)
      if (error) {
        return badRequest(error)
      }
      type RequestParams = {
        zipCode: string
      }
      const { zipCode } = request.params as RequestParams
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
