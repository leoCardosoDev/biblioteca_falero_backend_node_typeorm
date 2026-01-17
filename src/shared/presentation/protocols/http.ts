export type HttpHeaders = {
  authorization?: string
  [key: string]: string | undefined
}

export interface HttpRequest<B = unknown, P = unknown, Q = unknown> {
  body?: B
  headers?: HttpHeaders
  params?: P
  query?: Q
  userId?: string
  role?: string
  ip?: string
}

export interface HttpResponse<B = unknown> {
  statusCode: number
  body: B
}
