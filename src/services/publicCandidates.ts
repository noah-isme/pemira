import { ACTIVE_ELECTION_ID } from '../config/env'
import type { Candidate } from '../types/voting'
import { apiRequest } from '../utils/apiClient'

type PublicCandidateResponse = {
  id: number
  number: number
  name: string
  faculty_name?: string
  study_program_name?: string
  cohort_year?: number
  photo_url?: string
}

const mapCandidate = (item: PublicCandidateResponse): Candidate => ({
  id: item.id,
  nomorUrut: item.number,
  nama: item.name,
  fakultas: item.faculty_name ?? 'Fakultas',
  prodi: item.study_program_name ?? '',
  angkatan: item.cohort_year?.toString() ?? '',
  foto: item.photo_url ?? '',
})

export const fetchPublicCandidates = async (options?: { signal?: AbortSignal; token?: string }): Promise<Candidate[]> => {
  const { signal, token } = options ?? {}
  const parseItems = (response: any) => {
    if (Array.isArray(response?.data?.items)) return response.data.items
    if (Array.isArray(response?.items)) return response.items
    if (Array.isArray(response)) return response
    return null
  }

  try {
    const response = await apiRequest<any>(`/elections/${ACTIVE_ELECTION_ID}/candidates`, { signal })
    const items = parseItems(response)
    if (!items) throw new Error('Invalid candidates response')
    return (items as PublicCandidateResponse[]).map(mapCandidate)
  } catch (err) {
    if (token) {
      const fallBackResponse = await apiRequest<any>(`/admin/elections/${ACTIVE_ELECTION_ID}/candidates`, { signal, token })
      const items = parseItems(fallBackResponse)
      if (!items) throw new Error('Invalid admin candidates response')
      return (items as PublicCandidateResponse[]).map(mapCandidate)
    }
    throw err
  }
}
