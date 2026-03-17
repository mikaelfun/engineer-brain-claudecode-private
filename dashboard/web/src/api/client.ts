/**
 * API Client — 统一 HTTP 请求封装 (adapted from RDSE2)
 */

export const BASE_URL = '/api'

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message?: string
  ) {
    super(message || `API Error: ${status} ${statusText}`)
    this.name = 'ApiError'
  }
}

function getAuthHeaders(): HeadersInit {
  const token = localStorage.getItem('eb_token')
  return token ? { 'Authorization': `Bearer ${token}` } : {}
}

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    if (res.status === 401) {
      localStorage.removeItem('eb_token')
      window.location.reload()
      throw new ApiError(res.status, res.statusText, 'Session expired')
    }
    const text = await res.text().catch(() => '')
    throw new ApiError(res.status, res.statusText, text)
  }
  return res.json()
}

export async function apiGet<T>(path: string, params?: Record<string, any>): Promise<T> {
  const url = new URL(`${BASE_URL}${path}`, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') {
        url.searchParams.set(k, String(v))
      }
    })
  }
  const res = await fetch(url.toString(), {
    headers: getAuthHeaders()
  })
  return handleResponse<T>(res)
}

export async function apiPost<T>(path: string, data?: any): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: data ? JSON.stringify(data) : undefined,
  })
  return handleResponse<T>(res)
}

export async function apiPatch<T>(path: string, data: any): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data),
  })
  return handleResponse<T>(res)
}

export async function apiPut<T>(path: string, data: any): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: JSON.stringify(data),
  })
  return handleResponse<T>(res)
}

export async function apiDelete<T>(path: string, data?: any): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
      ...getAuthHeaders()
    },
    body: data ? JSON.stringify(data) : undefined,
  })
  return handleResponse<T>(res)
}
