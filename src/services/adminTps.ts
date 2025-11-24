import { ACTIVE_ELECTION_ID } from '../config/env'
import type { TPSAdmin, TPSOperator, TPSStatus } from '../types/tpsAdmin'
import { apiRequest } from '../utils/apiClient'

type AdminTpsDTO = {
  id: number
  code: string
  name: string
  location: string
  capacity: number
  is_active: boolean
  open_time?: string | null
  close_time?: string | null
  pic_name?: string | null
  pic_phone?: string | null
  notes?: string | null
  has_active_qr: boolean
  created_at: string
  updated_at: string
}

type AdminTpsQrMetadata = {
  tps_id: number
  code: string
  name: string
  active_qr?: { id: number; qr_token: string; created_at: string } | null
}

type AdminTpsQrPrint = {
  tps_id: number
  code: string
  name: string
  qr_payload: string
}

type AdminTpsOperatorDTO = {
  user_id: number
  username: string
  name?: string
  email?: string
}

export type CreateTPSOperatorPayload = {
  username: string
  password: string
  name?: string
  email?: string
}

const toStatus = (isActive: boolean): TPSStatus => (isActive ? 'active' : 'inactive')

const normalizeText = (value?: string | null) => (value && value.trim() ? value : undefined)

const mapTps = (item: AdminTpsDTO): TPSAdmin => ({
  id: item.id.toString(),
  kode: item.code,
  nama: item.name,
  lokasi: item.location,
  kapasitas: item.capacity ?? 0,
  jamBuka: normalizeText(item.open_time),
  jamTutup: normalizeText(item.close_time),
  picNama: normalizeText(item.pic_name),
  picKontak: normalizeText(item.pic_phone),
  catatan: normalizeText(item.notes),
  status: toStatus(Boolean(item.is_active)),
  qrAktif: Boolean(item.has_active_qr),
  createdAt: item.created_at,
  updatedAt: item.updated_at,
})

const mapOperator = (op: AdminTpsOperatorDTO): TPSOperator => ({
  userId: op.user_id,
  username: op.username,
  name: op.name,
  email: op.email,
})

const unwrapItems = (response: any): AdminTpsDTO[] | null => {
  if (Array.isArray(response)) return response as AdminTpsDTO[]
  if (Array.isArray(response?.items)) return response.items as AdminTpsDTO[]
  if (Array.isArray(response?.data?.items)) return response.data.items as AdminTpsDTO[]
  return null
}

const withElectionQuery = (path: string, electionId: number | null = ACTIVE_ELECTION_ID) => {
  if (!electionId) return path
  const connector = path.includes('?') ? '&' : '?'
  return `${path}${connector}election_id=${electionId}`
}

const buildBody = (payload: TPSAdmin) => ({
  code: payload.kode,
  name: payload.nama,
  location: payload.lokasi,
  capacity: payload.kapasitas,
  open_time: normalizeText(payload.jamBuka),
  close_time: normalizeText(payload.jamTutup),
  pic_name: normalizeText(payload.picNama),
  pic_phone: normalizeText(payload.picKontak),
  notes: normalizeText(payload.catatan),
})

export const fetchAdminTpsList = async (token: string, electionId: number | null = ACTIVE_ELECTION_ID): Promise<TPSAdmin[]> => {
  const response = await apiRequest<any>(withElectionQuery('/admin/tps', electionId), { token })
  const items = unwrapItems(response)
  if (!items) {
    throw new Error('Invalid TPS list response')
  }
  return items.map(mapTps)
}

export const fetchAdminTpsDetail = async (token: string, id: string, electionId: number | null = ACTIVE_ELECTION_ID): Promise<TPSAdmin> => {
  const response = await apiRequest<any>(withElectionQuery(`/admin/tps/${id}`, electionId), { token })
  const data = (response?.data ?? response) as AdminTpsDTO | undefined
  if (!data) {
    throw new Error('Invalid TPS detail response')
  }
  return mapTps(data)
}

export const createAdminTps = async (token: string, payload: TPSAdmin, electionId: number | null = ACTIVE_ELECTION_ID): Promise<TPSAdmin> => {
  const body = buildBody(payload)
  const response = await apiRequest<AdminTpsDTO>('/admin/tps', { method: 'POST', token, body: { ...body, election_id: electionId ?? 1, is_active: payload.status === 'active' } })
  return mapTps(response)
}

export const updateAdminTps = async (token: string, id: string, payload: TPSAdmin, electionId: number | null = ACTIVE_ELECTION_ID): Promise<TPSAdmin> => {
  const body = { ...buildBody(payload), is_active: payload.status === 'active' }
  const response = await apiRequest<AdminTpsDTO>(withElectionQuery(`/admin/tps/${id}`, electionId), { method: 'PUT', token, body })
  return mapTps(response)
}

export const deleteAdminTps = async (token: string, id: string, electionId: number | null = ACTIVE_ELECTION_ID): Promise<void> => {
  await apiRequest(withElectionQuery(`/admin/tps/${id}`, electionId), { method: 'DELETE', token })
}

export const fetchAdminTpsQrMetadata = async (token: string, id: string) => {
  const response = await apiRequest<AdminTpsQrMetadata>(`/admin/tps/${id}/qr`, { token })
  const active = response?.active_qr
  return {
    qrToken: active?.qr_token,
    qrCreatedAt: active?.created_at,
    qrAktif: Boolean(active),
  }
}

export const rotateAdminTpsQr = async (token: string, id: string) => {
  const response = await apiRequest<AdminTpsQrMetadata>(`/admin/tps/${id}/qr/rotate`, { method: 'POST', token })
  const active = response?.active_qr
  return {
    qrToken: active?.qr_token,
    qrCreatedAt: active?.created_at,
    qrAktif: Boolean(active),
  }
}

export const fetchAdminTpsQrForPrint = async (token: string, id: string) => {
  const response = await apiRequest<AdminTpsQrPrint>(`/admin/tps/${id}/qr/print`, { token })
  return response.qr_payload
}

export const fetchAdminTpsOperators = async (token: string, id: string): Promise<TPSOperator[]> => {
  const response = await apiRequest<AdminTpsOperatorDTO[]>(`/admin/tps/${id}/operators`, { token })
  return response.map(mapOperator)
}

export const createAdminTpsOperator = async (token: string, id: string, payload: CreateTPSOperatorPayload): Promise<TPSOperator> => {
  const response = await apiRequest<AdminTpsOperatorDTO>(`/admin/tps/${id}/operators`, {
    method: 'POST',
    token,
    body: payload,
  })
  return mapOperator(response)
}

export const deleteAdminTpsOperator = async (token: string, tpsId: string, userId: number): Promise<void> => {
  await apiRequest(`/admin/tps/${tpsId}/operators/${userId}`, { method: 'DELETE', token })
}
