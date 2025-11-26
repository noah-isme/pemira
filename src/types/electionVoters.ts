/**
 * Type definitions for the new Election Voters API
 * Based on the API contract with partial unique NIM and election_voters table
 */

export type ElectionVoterStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'VOTED' | 'BLOCKED'
export type VotingMethod = 'ONLINE' | 'TPS'
export type VoterType = 'STUDENT' | 'LECTURER' | 'STAFF'
export type AcademicStatus = 'ACTIVE' | 'GRADUATED' | 'ON_LEAVE' | 'DROPPED' | 'INACTIVE'

/**
 * Voter lookup response from GET /admin/elections/{election_id}/voters/lookup
 */
export type VoterLookup = {
  voter: {
    id: number
    nim: string
    name: string
    voter_type: VoterType
    email?: string
    faculty_code?: string
    study_program_code?: string
    cohort_year?: number
    academic_status?: AcademicStatus
    has_account: boolean
    lecturer_id?: number | null
    staff_id?: number | null
    voting_method?: VotingMethod
  }
  election_voter?: {
    election_voter_id: number
    election_id: number
    voter_id: number
    nim: string
    status: ElectionVoterStatus
    voting_method: VotingMethod
    tps_id: number | null
    checked_in_at: string | null
    voted_at: string | null
    updated_at: string
    voter_type: VoterType
    name: string
    email: string
    faculty_code?: string
    study_program_code?: string
    cohort_year?: number
  }
}

/**
 * Request body for POST /admin/elections/{election_id}/voters
 */
export type VoterRegistrationRequest = {
  voter_type: VoterType
  nim: string
  name: string
  email: string
  phone?: string
  faculty_code?: string
  faculty_name?: string
  study_program_code?: string
  study_program_name?: string
  cohort_year?: number
  academic_status?: AcademicStatus
  lecturer_id?: number | null
  staff_id?: number | null
  voting_method: VotingMethod
  tps_id?: number | null
  status?: ElectionVoterStatus // Default: PENDING
}

/**
 * Response from POST /admin/elections/{election_id}/voters
 */
export type VoterRegistrationResponse = {
  voter_id: number
  election_voter_id: number
  status: ElectionVoterStatus
  voting_method: VotingMethod
  tps_id: number | null
  created_voter: boolean // true if new row in voters table
  created_election_voter: boolean // true if new enrollment in election
  duplicate_in_election: boolean // true if (election_id, nim) already exists
}

/**
 * Item in voter list from GET /admin/elections/{election_id}/voters
 */
export type ElectionVoterItem = {
  election_voter_id: number
  election_id: number
  voter_id: number
  nim: string
  name: string
  email: string | null
  voter_type: VoterType
  faculty_code: string | null
  faculty_name: string | null
  study_program_code: string | null
  study_program_name: string | null
  cohort_year: number | null
  academic_status: AcademicStatus | null
  status: ElectionVoterStatus
  voting_method: VotingMethod
  tps_id: number | null
  checked_in_at: string | null
  voted_at: string | null
  has_voted: boolean | null
  updated_at: string
}

/**
 * Paginated response from GET /admin/elections/{election_id}/voters
 */
export type ElectionVotersListResponse = {
  items: ElectionVoterItem[]
  page: number
  limit: number
  total_items: number
  total_pages: number
}

/**
 * Update request for PATCH /admin/elections/{election_id}/voters/{election_voter_id}
 */
export type ElectionVoterUpdate = {
  status?: ElectionVoterStatus
  voting_method?: VotingMethod
  tps_id?: number | null
}

/**
 * Voter self-registration request for POST /voters/me/elections/{election_id}/register
 */
export type VoterSelfRegisterRequest = {
  voting_method: VotingMethod
  tps_id?: number | null
}

/**
 * Response from POST /voters/me/elections/{election_id}/register
 */
export type VoterSelfRegisterResponse = {
  election_voter_id: number
  election_id: number
  voter_id: number
  nim: string
  status: ElectionVoterStatus
  voting_method: VotingMethod
  tps_id: number | null
  checked_in_at: string | null
  voted_at: string | null
  updated_at: string
}

/**
 * Response from GET /voters/me/elections/{election_id}/status
 */
export type VoterElectionStatus = {
  election_voter_id: number
  election_id: number
  voter_id: number
  nim: string
  status: ElectionVoterStatus
  voting_method: VotingMethod
  tps_id: number | null
  checked_in_at: string | null
  voted_at: string | null
  updated_at: string
  voter_type: VoterType
  name: string
  email: string
  faculty_code?: string
  study_program_code?: string
  cohort_year?: number
}

/**
 * Query parameters for listing election voters
 */
export type ElectionVotersQueryParams = {
  page?: number
  limit?: number
  search?: string // NIM or name
  voter_type?: VoterType
  status?: ElectionVoterStatus
  voting_method?: VotingMethod
  faculty_code?: string
  study_program_code?: string
  cohort_year?: number
  tps_id?: number
}

/**
 * Validation helper: Check if NIM is required
 */
export const isNimRequired = (voterType: VoterType): boolean => {
  return voterType === 'STUDENT'
}

/**
 * Validation helper: Validate voter registration data
 */
export const validateVoterRegistration = (data: VoterRegistrationRequest): string[] => {
  const errors: string[] = []
  
  if (!data.name?.trim()) {
    errors.push('Nama wajib diisi')
  }
  
  if (!data.email?.trim()) {
    errors.push('Email wajib diisi')
  }
  
  if (data.voter_type === 'STUDENT' && !data.nim?.trim()) {
    errors.push('NIM wajib diisi untuk mahasiswa')
  }
  
  if (!['ONLINE', 'TPS'].includes(data.voting_method)) {
    errors.push('Metode voting tidak valid')
  }
  
  if (data.voting_method === 'TPS' && !data.tps_id) {
    errors.push('TPS ID wajib diisi untuk metode TPS')
  }
  
  return errors
}
