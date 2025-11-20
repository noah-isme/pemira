import { API_BASE_URL } from '../config/env'

export type ApiError = {
  status: number
  code?: string
  message: string
}

export type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  headers?: Record<string, string>
  body?: unknown
  token?: string
  signal?: AbortSignal
}

const buildHeaders = (headers: Record<string, string> = {}, token?: string) => {
  const next: Record<string, string> = { ...headers }
  if (token) next.Authorization = `Bearer ${token}`
  if (next['Content-Type'] === undefined && headers['Content-Type'] === undefined && headers['content-type'] === undefined && headers['Content-type'] === undefined) {
    next['Content-Type'] = 'application/json'
  }
  return next
}

export const apiRequest = async <T>(path: string, options: RequestOptions = {}): Promise<T> => {
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path}`
  const headers = buildHeaders(options.headers, options.token)
  const response = await fetch(url, {
    method: options.method ?? 'GET',
    headers,
    body: headers['Content-Type'] === 'application/json' && options.body !== undefined ? JSON.stringify(options.body) : (options.body as BodyInit | null | undefined),
    signal: options.signal,
  })

  const contentType = response.headers.get('Content-Type')
  const isJson = contentType?.includes('application/json')
  const payload = isJson ? await response.json() : await response.text()

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      code: isJson ? payload?.error?.code || payload?.code : undefined,
      message: isJson ? payload?.error?.message || payload?.message || 'Request failed' : 'Request failed',
    }
    throw error
  }

  return payload as T
}
