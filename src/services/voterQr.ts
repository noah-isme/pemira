import { ACTIVE_ELECTION_ID } from '../config/env'
import { apiRequest } from '../utils/apiClient'

export type VoterQRResult = {
  id: number
  voter_id: number
  election_id: number
  qr_token: string
  is_active: boolean
  rotated_at?: string | null
  created_at: string
}

export const getVoterQr = (token: string, voterId: number) => {
  const params = new URLSearchParams({ election_id: String(ACTIVE_ELECTION_ID) })
  return apiRequest<VoterQRResult>(`/voters/${voterId}/tps/qr?${params.toString()}`, { token })
}

export const rotateVoterQr = (token: string, voterId: number) => {
  return apiRequest<VoterQRResult>(`/voters/${voterId}/tps/qr`, {
    method: 'POST',
    token,
    body: { election_id: ACTIVE_ELECTION_ID },
  })
}
