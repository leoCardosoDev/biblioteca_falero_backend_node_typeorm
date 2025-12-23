export type LoadAccountByTokenParams = {
  accessToken: string
  role?: string
}

export interface LoadAccountByToken {
  load: (params: LoadAccountByTokenParams) => Promise<{ id: string; name: string } | undefined>
}
