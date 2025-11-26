import { apiRequest } from '../utils/apiClient'
import type { 
  ElectionVoterStatus, 
  VotingMethod, 
  VoterType,
  VoterSelfRegisterRequest as VoterSelfRegisterRequestType,
  VoterSelfRegisterResponse as VoterSelfRegisterResponseType,
  VoterElectionStatus
} from '../types/electionVoters'

// Re-export types for backward compatibility
export type VoterSelfRegisterRequest = VoterSelfRegisterRequestType
export type VoterSelfRegisterResponse = VoterSelfRegisterResponseType
export type VoterElectionStatusResponse = VoterElectionStatus

// ========== API Functions ==========

/**
 * Self-register to election
 * POST /voters/me/elections/{election_id}/register
 */
export const selfRegisterToElection = async (
  token: string,
  electionId: number,
  data: VoterSelfRegisterRequest
): Promise<VoterSelfRegisterResponse> => {
  const response = await apiRequest<{ data: VoterSelfRegisterResponse } | VoterSelfRegisterResponse>(
    `/voters/me/elections/${electionId}/register`,
    {
      method: 'POST',
      token,
      body: data,
    }
  )
  // Handle both wrapped and unwrapped responses
  return (response as any).data || response as VoterSelfRegisterResponse
}

/**
 * Get voter's election status
 * GET /voters/me/elections/{election_id}/status
 */
export const getVoterElectionStatus = async (
  token: string,
  electionId: number
): Promise<VoterElectionStatusResponse> => {
  const response = await apiRequest<{ data: VoterElectionStatusResponse } | VoterElectionStatusResponse>(
    `/voters/me/elections/${electionId}/status`,
    { token }
  )
  // Handle both wrapped and unwrapped responses
  return (response as any).data || response as VoterElectionStatusResponse
}
