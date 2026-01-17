import axios from 'axios'
import { AxiosHttpClient } from '@/shared/infra/http/axios-http-client'

jest.mock('axios')

const mockAxios = axios as jest.Mocked<typeof axios>

describe('AxiosHttpClient', () => {
  let sut: AxiosHttpClient

  beforeEach(() => {
    sut = new AxiosHttpClient()
    mockAxios.request.mockClear()
    mockAxios.request.mockResolvedValue({
      status: 200,
      data: 'any_data'
    })
  })

  test('Should call axios with correct values', async () => {
    const request = {
      url: 'any_url',
      method: 'get' as const,
      body: { any: 'body' },
      headers: { any: 'header' }
    }
    await sut.request(request)
    expect(mockAxios.request).toHaveBeenCalledWith({
      url: 'any_url',
      method: 'get',
      data: { any: 'body' },
      headers: { any: 'header' }
    })
  })

  test('Should return correct response on axios success', async () => {
    const httpResponse = await sut.request({
      url: 'any_url',
      method: 'get'
    })
    expect(httpResponse).toEqual({
      statusCode: 200,
      data: 'any_data'
    })
  })

  test('Should return correct response on axios failure', async () => {
    mockAxios.request.mockRejectedValueOnce({
      response: {
        status: 500,
        data: 'any_error'
      }
    })
    const httpResponse = await sut.request({
      url: 'any_url',
      method: 'get'
    })
    expect(httpResponse).toEqual({
      statusCode: 500,
      data: 'any_error'
    })
  })
})
