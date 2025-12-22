export interface HttpRequest {
  body?: unknown
  headers?: unknown
  params?: unknown
  query?: unknown
}

export interface HttpResponse {
  statusCode: number
  body: unknown
}
