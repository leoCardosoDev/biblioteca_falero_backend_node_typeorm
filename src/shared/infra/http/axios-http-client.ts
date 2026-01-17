import axios, { AxiosResponse } from 'axios'
import { HttpClient, HttpRequest, HttpResponse } from '@/shared/application/protocols/http/http-client'

export class AxiosHttpClient implements HttpClient {
  async request(data: HttpRequest): Promise<HttpResponse> {
    let axiosResponse: AxiosResponse
    try {
      axiosResponse = await axios.request({
        url: data.url,
        method: data.method,
        data: data.body,
        headers: data.headers as Record<string, string>
      })
    } catch (error) {
      const _error = error as { response: AxiosResponse }
      axiosResponse = _error.response
    }
    return {
      statusCode: axiosResponse.status,
      data: axiosResponse.data
    }
  }
}
