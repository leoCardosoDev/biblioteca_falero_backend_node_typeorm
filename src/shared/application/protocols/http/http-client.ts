export type HttpRequest = {
  url: string
  method: 'get' | 'post' | 'put' | 'delete'
  body?: unknown
  headers?: unknown
}

export type HttpResponse<T = unknown> = {
  statusCode: number
  data: T
}

export interface HttpClient<R = unknown> {
  request: (data: HttpRequest) => Promise<HttpResponse<R>>
}
