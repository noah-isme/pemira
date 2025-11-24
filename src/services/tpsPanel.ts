import { apiRequest } from '../utils/apiClient'
import type { TPSQueueEntry } from '../types/tpsPanel'

type PanelSummaryResponse = {
  id: number
  code: string
  name: string
  location: string
  status: string
  voting_date?: string
  open_time?: string
  close_time?: string
  stats?: {
    total_checkins: number
    approved_checkins: number
    pending_checkins: number
    total_votes: number
  }
}

type QueueResponse = {
  items: Array<{
    id: number
    status: string
    scan_at: string
    has_voted: boolean
    voter: {
      nim: string
      name: string
      faculty: string
      study_program: string
    }
  }>
}

const mapStatus = (status: string): TPSQueueEntry['status'] => {
  const normalized = status.toUpperCase()
  if (normalized === 'APPROVED') return 'verified'
  if (normalized === 'REJECTED') return 'rejected'
  if (normalized === 'CANCELLED') return 'cancelled'
  return 'waiting'
}

export const fetchTpsPanelSummary = async (token: string, tpsId: string): Promise<PanelSummaryResponse> => {
  const response = await apiRequest<PanelSummaryResponse>(`/tps/${tpsId}/summary`, { token })
  return response
}

export const fetchTpsPanelQueue = async (token: string, tpsId: string, status = 'PENDING'): Promise<TPSQueueEntry[]> => {
  const response = await apiRequest<QueueResponse>(`/tps/${tpsId}/checkins?status=${status}`, { token })
  return (response.items || []).map((item) => ({
    id: item.id.toString(),
    nim: item.voter.nim,
    nama: item.voter.name,
    prodi: item.voter.study_program,
    mode: 'mobile',
    status: mapStatus(item.status),
    waktuScan: item.scan_at,
    hasVoted: item.has_voted,
  }))
}

export const approveTpsCheckin = async (token: string, tpsId: string, checkinId: string) => {
  await apiRequest(`/tps/${tpsId}/checkins/${checkinId}/approve`, { method: 'POST', token })
}

export const rejectTpsCheckin = async (token: string, tpsId: string, checkinId: string, reason = 'Data tidak sesuai') => {
  await apiRequest(`/tps/${tpsId}/checkins/${checkinId}/reject`, { method: 'POST', token, body: { reason } })
}
