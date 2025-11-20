import { ACTIVE_ELECTION_ID } from '../config/env'
import type { TPSAdmin, TPSPanitia, TPSStatus } from '../types/tpsAdmin'
import { apiRequest } from '../utils/apiClient'

type ApiTPSStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED'

const toAppStatus = (status: ApiTPSStatus): TPSStatus => {
  if (status === 'ACTIVE') return 'active'
  if (status === 'CLOSED') return 'closed'
  return 'draft'
}

const toApiStatus = (status: TPSStatus): ApiTPSStatus => {
  if (status === 'active') return 'ACTIVE'
  if (status === 'closed') return 'CLOSED'
  return 'DRAFT'
}

type AdminTpsListItem = {
  id: number
  code: string
  name: string
  location: string
  status: ApiTPSStatus
  voting_date: string
  open_time: string
  close_time: string
  total_votes: number
  total_checkins: number
}

type AdminTpsDetail = AdminTpsListItem & {
  election_id: number
  capacity_estimate: number
  area_faculty: { id: number | null; name: string | null }
  qr?: { id: number; qr_secret_suffix: string; is_active: boolean; created_at: string }
  stats?: {
    total_votes: number
    total_checkins: number
    pending_checkins: number
    approved_checkins: number
    rejected_checkins: number
  }
  panitia: { user_id: number; name: string; role: string }[]
}

const mapTps = (item: AdminTpsListItem | AdminTpsDetail): TPSAdmin => ({
  id: item.id.toString(),
  kode: item.code,
  nama: item.name,
  fakultasArea: 'area_faculty' in item && item.area_faculty?.name ? item.area_faculty.name : 'Semua Fakultas',
  lokasi: item.location,
  deskripsi: '',
  tipe: 'umum',
  tanggalVoting: item.voting_date,
  jamBuka: item.open_time,
  jamTutup: item.close_time,
  kapasitas: 'capacity_estimate' in item ? item.capacity_estimate : 0,
  dptTarget: [],
  qrId: 'qr' in item && item.qr ? item.qr.qr_secret_suffix : '',
  qrStatus: 'qr' in item && item.qr ? (item.qr.is_active ? 'aktif' : 'nonaktif') : 'nonaktif',
  status: toAppStatus(item.status),
  panitia:
    'panitia' in item
      ? item.panitia.map((member) => ({
          id: member.user_id.toString(),
          userId: member.user_id,
          nama: member.name,
          peran: member.role,
        }))
      : [],
  totalSuara: item.total_votes ?? ('stats' in item && item.stats ? item.stats.total_votes : 0),
  totalCheckins: 'total_checkins' in item ? item.total_checkins : undefined,
  qrCreatedAt: 'qr' in item && item.qr ? item.qr.created_at : undefined,
})

export const fetchAdminTpsList = async (token: string): Promise<TPSAdmin[]> => {
  const response = await apiRequest<any>('/admin/tps', { token })
  const items = Array.isArray(response?.data?.items)
    ? response.data.items
    : Array.isArray(response?.items)
      ? response.items
      : Array.isArray(response)
        ? response
        : null
  if (!items) {
    throw new Error('Invalid TPS list response')
  }
  return (items as AdminTpsListItem[]).map(mapTps)
}

export const fetchAdminTpsDetail = async (token: string, id: string): Promise<TPSAdmin> => {
  const response = await apiRequest<any>(`/admin/tps/${id}`, { token })
  const data = response?.data ?? response
  if (!data) {
    throw new Error('Invalid TPS detail response')
  }
  return mapTps(data as AdminTpsDetail)
}

export const createAdminTps = async (token: string, payload: TPSAdmin): Promise<TPSAdmin> => {
  const body = {
    election_id: ACTIVE_ELECTION_ID,
    code: payload.kode,
    name: payload.nama,
    location: payload.lokasi,
    voting_date: payload.tanggalVoting,
    open_time: payload.jamBuka,
    close_time: payload.jamTutup,
    capacity_estimate: payload.kapasitas,
    status: toApiStatus(payload.status),
  }
  const response = await apiRequest<{ success: boolean; data: { id: number; status: ApiTPSStatus } }>('/admin/tps', { method: 'POST', token, body })
  return { ...payload, id: response.data.id.toString(), status: toAppStatus(response.data.status) }
}

export const updateAdminTps = async (token: string, id: string, payload: TPSAdmin): Promise<TPSAdmin> => {
  const body = {
    code: payload.kode,
    name: payload.nama,
    location: payload.lokasi,
    voting_date: payload.tanggalVoting,
    open_time: payload.jamBuka,
    close_time: payload.jamTutup,
    capacity_estimate: payload.kapasitas,
    status: toApiStatus(payload.status),
  }
  const response = await apiRequest<{ success: boolean; data: { id: number; status: ApiTPSStatus } }>(`/admin/tps/${id}`, {
    method: 'PUT',
    token,
    body,
  })
  return { ...payload, id: response.data.id.toString(), status: toAppStatus(response.data.status) }
}

export const assignPanitiaTps = async (token: string, id: string, panitia: TPSPanitia[]) => {
  const members = panitia
    .map((member) => ({
      user_id: member.userId,
      role: member.peran,
    }))
    .filter((member) => member.user_id !== undefined)
  if (members.length === 0) return
  await apiRequest(`/admin/tps/${id}/panitia`, { method: 'PUT', token, body: { members } })
}

export const regenerateQrTps = async (token: string, id: string) => {
  const response = await apiRequest<{ success: boolean; data: { qr: { payload: string; created_at: string } } }>(`/admin/tps/${id}/qr/regenerate`, {
    method: 'POST',
    token,
  })
  return response.data.qr
}
