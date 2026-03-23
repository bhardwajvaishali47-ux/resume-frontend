const API_BASE = 'http://localhost:8000'

const getToken = () => localStorage.getItem('token')

export const loginUser = async (email: string, password: string) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  })
  return response.json()
}

export const registerUser = async (
  email: string,
  password: string,
  full_name: string
) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password, full_name })
  })
  return response.json()
}

export const getGoogleAuthUrl = async () => {
  const response = await fetch(`${API_BASE}/auth/google/url`)
  return response.json()
}

export const handleGoogleCallback = async (code: string) => {
  const response = await fetch(
    `${API_BASE}/auth/google/callback?code=${code}`,
    { method: 'POST' }
  )
  return response.json()
}

export const analyzeResume = async (
  file: File,
  jobDescription: string
) => {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('job_description', jobDescription)
  const response = await fetch(`${API_BASE}/analyze`, {
    method: 'POST',
    body: formData
  })
  return response.json()
}

export const generateCoverLetter = async (
  parsedResume: object,
  jobDescription: string,
  matchResult: object
) => {
  const response = await fetch(`${API_BASE}/cover-letter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      parsed_resume: parsedResume,
      job_description: jobDescription,
      match_result: matchResult
    })
  })
  return response.json()
}

export const chatWithCoach = async (
  message: string,
  sessionId: string,
  parsedResume: object,
  jobDescription: string,
  matchResult: object
) => {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message,
      session_id: sessionId,
      parsed_resume: parsedResume,
      job_description: jobDescription,
      match_result: matchResult
    })
  })
  return response.json()
}

export const getJobListings = async (
  parsedResume: object,
  matchResult: object,
  jobDescription: string,
  country: string
) => {
  const response = await fetch(`${API_BASE}/jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      parsed_resume: parsedResume,
      match_result: matchResult,
      job_description: jobDescription,
      country
    })
  })
  return response.json()
}