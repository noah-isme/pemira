import { apiRequest } from '../utils/apiClient'

export type AuthUserProfile = {
  name?: string
  faculty_name?: string
  study_program_name?: string
  cohort_year?: number
  semester?: string
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

// Registration Response Types (API v1.0)
export type StudentRegistrationResponse = {
  voter_id: number
  name: string
  nim: string
  email?: string
  phone?: string
  voter_type: 'STUDENT'
  faculty_name?: string
  program_name?: string
  cohort_year?: number
  message: string
}

export type LecturerRegistrationResponse = {
  voter_id: number
  name: string
  nidn: string
  email?: string
  phone?: string
  voter_type: 'LECTURER'
  faculty_name?: string
  department?: string
  position?: string
  message: string
}

export type StaffRegistrationResponse = {
  voter_id: number
  name: string
  nip: string
  email?: string
  phone?: string
  voter_type: 'STAFF'
  unit?: string
  job_title?: string
  message: string
}

export type RegistrationResponse = 
  | StudentRegistrationResponse 
  | LecturerRegistrationResponse 
  | StaffRegistrationResponse

// Legacy type for backward compatibility
export type RegisterResponse = { user: AuthUser; message: string; voting_mode?: 'ONLINE' | 'TPS' }

// Check Availability Response
export type CheckAvailabilityResponse = {
  available: boolean
  name?: string
  type?: 'STUDENT' | 'LECTURER' | 'STAFF'
  reason?: string
  message: string
}

export const loginUser = (username: string, password: string) =>
  apiRequest<AuthResponse>('/auth/login', { method: 'POST', body: { username, password } })

// New API v1.0 Registration Functions (Manual Input)
export const registerStudent = (payload: {
  nim: string
  name: string
  password: string
  email?: string
  phone?: string
  photo_url?: string
}) =>
  apiRequest<{ data: StudentRegistrationResponse } | StudentRegistrationResponse>(
    '/voters/register/student',
    {
      method: 'POST',
      body: payload,
    }
  ).then(res => (res as any).data || res as StudentRegistrationResponse)

export const registerLecturer = (payload: {
  nidn: string
  name: string
  password: string
  email?: string
  phone?: string
  photo_url?: string
}) =>
  apiRequest<{ data: LecturerRegistrationResponse } | LecturerRegistrationResponse>(
    '/voters/register/lecturer',
    {
      method: 'POST',
      body: payload,
    }
  ).then(res => (res as any).data || res as LecturerRegistrationResponse)

export const registerStaff = (payload: {
  nip: string
  name: string
  password: string
  email?: string
  phone?: string
  photo_url?: string
}) =>
  apiRequest<{ data: StaffRegistrationResponse } | StaffRegistrationResponse>(
    '/voters/register/staff',
    {
      method: 'POST',
      body: payload,
    }
  ).then(res => (res as any).data || res as StaffRegistrationResponse)

export const checkIdentityAvailability = (
  type: 'student' | 'lecturer' | 'staff',
  identifier: string
) =>
  apiRequest<{ data: CheckAvailabilityResponse } | CheckAvailabilityResponse>(
    `/voters/register/check/${type}/${identifier}`,
    { method: 'GET' }
  ).then(res => (res as any).data || res as CheckAvailabilityResponse)

// Legacy function for backward compatibility
export const registerLecturerOrStaff = (payload: {
  username: string
  name: string
  email?: string
  password: string
  type: 'LECTURER' | 'STAFF'
  faculty_name?: string
  department_name?: string
  unit_name?: string
  voting_mode?: 'ONLINE' | 'TPS'
}) =>
  apiRequest<RegisterResponse>('/auth/register/lecturer-staff', {
    method: 'POST',
    body: {
      type: payload.type,
      nidn: payload.type === 'LECTURER' ? payload.username : undefined,
      nip: payload.type === 'STAFF' ? payload.username : undefined,
      name: payload.name,
      email: payload.email,
      faculty_name: payload.faculty_name,
      department_name: payload.department_name,
      unit_name: payload.unit_name,
      password: payload.password,
      voting_mode: payload.voting_mode,
    },
  })

export const refreshToken = (refreshTokenValue: string) => {
  return apiRequest<AuthTokens>('/auth/refresh', { method: 'POST', body: { refresh_token: refreshTokenValue } })
}

export const fetchAuthMe = (token: string, options?: { signal?: AbortSignal }) => {
  return apiRequest<AuthUser>('/auth/me', { token, signal: options?.signal })
}
