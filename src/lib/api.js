const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'

function getToken() {
  return localStorage.getItem('zana_token')
}

export async function apiRequest(path, options = {}) {
  const { method = 'GET', body, auth = true } = options
  const headers = { 'Content-Type': 'application/json' }

  if (auth) {
    const token = getToken()
    if (token) {
      headers.Authorization = `Bearer ${token}`
    }
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new Error(data.message || 'Request failed')
  }

  const normalize = (value) => {
    if (Array.isArray(value)) return value.map(normalize)
    if (value && typeof value === 'object') {
      const next = { ...value }
      if (next._id && !next.id) {
        next.id = String(next._id)
      }
      return next
    }
    return value
  }

  return normalize(data)
}

export function setToken(token) {
  if (token) localStorage.setItem('zana_token', token)
}

export function clearToken() {
  localStorage.removeItem('zana_token')
}

