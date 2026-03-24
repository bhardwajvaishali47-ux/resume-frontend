const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export async function loginUser(email: string, password: string) {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  return res.json()
}

export async function registerUser(email: string, password: string, full_name: string) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name }),
  })
  return res.json()
}

export async function getGoogleAuthUrl() {
  const res = await fetch(`${API_BASE}/auth/google/url`)
  return res.json()
}
