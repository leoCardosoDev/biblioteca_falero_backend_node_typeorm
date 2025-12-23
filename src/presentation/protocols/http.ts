export type HttpHeaders = {
  authorization?: string
  [key: string]: string | undefined
}

export interface HttpRequest {
  body?: unknown
  headers?: HttpHeaders
  params?: unknown
  query?: unknown
}

export interface HttpResponse {
  statusCode: number
  body: unknown
}
