import { apiRequest } from '../utils/apiClient'
import type { TPSPanelInfo, TPSPanelStats, TPSQueueEntry, TPSTimelinePoint } from '../types/tpsPanel'
import { getActiveElectionId } from '../state/activeElection'

type DashboardResponse = {
  election_id: number
  tps: { id: number; code: string; name: string }
  status: string
  stats: {
    total_registered_tps_voters: number
    total_checked_in: number
    total_voted: number
    total_not_voted: number
  }
  last_activity_at?: string | null
}

type QueueResponse = {
  items: Array<{
    checkin_id: number
    voter_id: number
    name: string
    nim: string
    faculty: string
    program: string
    status: string
    checkin_time: string
    voted_time?: string | null
  }>
  total?: number
}

type CreateCheckinResponse = {
  checkin_id: number
  status: string
  checkin_time?: string
  voted_time?: string | null
  voter: {
    nim: string
    name: string
    faculty: string
    program: string
  }
}

type TimelineResponse = {
  points: Array<{ hour: string; checked_in: number; voted: number }>
}

export type CreateCheckinPayload = {
  qr_payload?: string
  registration_code?: string
}

const mapStatus = (status: string): TPSQueueEntry['status'] => {
  const normalized = status.toUpperCase()
  if (normalized === 'VOTED') return 'VOTED'
  if (normalized === 'CHECKED_IN') return 'CHECKED_IN'
  return 'PENDING'
}

const withElectionPath = (path: string, electionId: number | null = getActiveElectionId()) =>
  electionId ? `/admin/elections/${electionId}${path}` : path

export const fetchTpsPanelDashboard = async (token: string, tpsId: string, electionId?: number | null): Promise<{ info: TPSPanelInfo; stats: TPSPanelStats }> => {
  const response = await apiRequest<DashboardResponse>(withElectionPath(`/tps/${tpsId}/dashboard`, electionId ?? getActiveElectionId()), { token })
  return {
    info: {
      tpsName: response.tps?.name ?? '-',
      tpsCode: response.tps?.code ?? '-',
      status: response.status ?? '-',
      totalVoters: response.stats?.total_registered_tps_voters ?? 0,
    },
    stats: {
      totalRegisteredTpsVoters: response.stats?.total_registered_tps_voters ?? 0,
      totalCheckedIn: response.stats?.total_checked_in ?? 0,
      totalVoted: response.stats?.total_voted ?? 0,
      totalNotVoted: response.stats?.total_not_voted ?? 0,
    },
  }
}

export const fetchTpsPanelQueue = async (token: string, tpsId: string, electionId?: number | null, status = 'ALL'): Promise<TPSQueueEntry[]> => {
  const response = await apiRequest<QueueResponse>(withElectionPath(`/tps/${tpsId}/checkins?status=${status}`, electionId ?? getActiveElectionId()), { token })
  return (response.items || []).map((item) => ({
    id: item.checkin_id.toString(),
    nim: item.nim,
    nama: item.name,
    fakultas: item.faculty,
    prodi: item.program,
    angkatan: '-',
    statusMahasiswa: '-',
    mode: 'mobile',
    status: mapStatus(item.status),
    waktuCheckIn: item.checkin_time,
    hasVoted: item.status.toUpperCase() === 'VOTED' || Boolean(item.voted_time),
    voteTime: item.voted_time ?? undefined,
  }))
}

export const fetchTpsPanelTimeline = async (token: string, tpsId: string, electionId?: number | null): Promise<TPSTimelinePoint[]> => {
  const response = await apiRequest<TimelineResponse>(withElectionPath(`/tps/${tpsId}/stats/timeline`, electionId ?? getActiveElectionId()), { token })
  return (response.points || []).map((p) => ({
    hour: p.hour,
    checkedIn: p.checked_in ?? 0,
    voted: p.voted ?? 0,
  }))
}

export const fetchTpsPanelLogs = async (token: string, tpsId: string, electionId?: number | null, limit = 50) => {
  const response = await apiRequest<{ items: Array<{ type: string; status?: string; voter_name?: string; voter_nim?: string; at: string }> }>(
    withElectionPath(`/tps/${tpsId}/logs?limit=${limit}`, electionId ?? getActiveElectionId()),
    { token }
  )
  return response.items || []
}

export const createTpsCheckin = async (token: string, tpsId: string, payload: CreateCheckinPayload, electionId?: number | null): Promise<TPSQueueEntry> => {
  const endpoint =
    payload.qr_payload !== undefined
      ? withElectionPath(`/tps/${tpsId}/checkin/scan`, electionId ?? getActiveElectionId())
      : withElectionPath(`/tps/${tpsId}/checkin/manual`, electionId ?? getActiveElectionId())

  const body = payload.qr_payload !== undefined 
    ? { qr_token: payload.qr_payload, registration_qr_payload: payload.qr_payload }
    : { nim: payload.registration_code, registration_code: payload.registration_code }

  const response = await apiRequest<any>(endpoint, {
    method: 'POST',
    token,
    body,
  })

  const data = response?.data ?? response
  const voter = data?.voter ?? {}
  
  return {
    id: data?.checkin_id?.toString() ?? `checkin-${Date.now()}`,
    nim: voter.nim ?? voter.id?.toString() ?? '',
    nama: voter.name ?? '',
    fakultas: voter.faculty ?? '',
    prodi: voter.program ?? '',
    angkatan: '-',
    statusMahasiswa: '-',
    mode: 'mobile',
    status: mapStatus(data?.status ?? 'CHECKED_IN'),
    waktuCheckIn: data?.checkin_time ?? new Date().toISOString(),
    hasVoted: (data?.status ?? '').toUpperCase() === 'VOTED',
    voteTime: data?.voted_time ?? undefined,
  }
}

export const approveTpsCheckin = async (token: string, tpsId: string, checkinId: string, electionId?: number | null) => {
  await apiRequest(withElectionPath(`/tps/${tpsId}/checkins/${checkinId}/approve`, electionId ?? getActiveElectionId()), { method: 'POST', token })
}

export const rejectTpsCheckin = async (token: string, tpsId: string, checkinId: string, reason = 'Data tidak sesuai', electionId?: number | null) => {
  await apiRequest(withElectionPath(`/tps/${tpsId}/checkins/${checkinId}/reject`, electionId ?? getActiveElectionId()), {
    method: 'POST',
    token,
    body: { reason },
  })
}

export const fetchTpsPanelStatus = async (token: string, tpsId: string, electionId?: number | null) => {
  const response = await apiRequest<{
    election_id: number
    tps_id: number
    status: string
    now: string
    voting_window?: { start_at: string; end_at: string }
  }>(withElectionPath(`/tps/${tpsId}/status`, electionId ?? getActiveElectionId()), { token })
  return response
}

export const fetchCheckinDetail = async (token: string, tpsId: string, checkinId: string, electionId?: number | null) => {
  const response = await apiRequest<any>(withElectionPath(`/tps/${tpsId}/checkins/${checkinId}`, electionId ?? getActiveElectionId()), { token })
  const data = response?.data ?? response
  return {
    checkinId: data?.checkin_id,
    electionId: data?.election_id,
    tpsId: data?.tps_id,
    voter: {
      id: data?.voter?.id,
      nim: data?.voter?.nim,
      name: data?.voter?.name,
      faculty: data?.voter?.faculty,
      program: data?.voter?.program,
    },
    status: data?.status,
    checkinTime: data?.checkin_time,
    votedTime: data?.voted_time,
  }
}
