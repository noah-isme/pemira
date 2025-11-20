import { apiRequest } from '../utils/apiClient'

export type AuthUserProfile = {
  name?: string
  faculty_name?: string
  study_program_name?: string
  cohort_year?: number
}

export type AuthUser = {
  id: number
  username: string
  role: string
  voter_id?: number
  profile?: AuthUserProfile
}

export type AuthTokens = {
  access_token: string
  refresh_token?: string
  token_type?: string
  expires_in?: number
}

export type AuthResponse = AuthTokens & { user: AuthUser }

export const loginUser = (username: string, password: string) => {
  return apiRequest<AuthResponse>('/auth/login', {
    method: 'POST',
    body: { username, password },
  })
}

export const registerStudent = (payload: { nim: string; name: string; email: string; password: string }) => {
  return apiRequest<AuthResponse>('/auth/register/student', {
    method: 'POST',
    body: payload,
  })
}

export const registerLecturerOrStaff = (payload: { username: string; name: string; email: string; password: string; type: 'LECTURER' | 'STAFF' }) => {
  return apiRequest<AuthResponse>('/auth/register/lecturer-staff', {
    method: 'POST',
    body: payload,
  })
}

export const refreshToken = (refreshTokenValue: string) => {
  return apiRequest<AuthTokens>('/auth/refresh', { method: 'POST', body: { refresh_token: refreshTokenValue } })
}
