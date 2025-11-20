export type CandidateStatus = 'draft' | 'active' | 'hidden' | 'archived'

export type CandidateMedia = {
  id: string
  type: 'photo' | 'video' | 'pdf'
  url: string
  label: string
}

export type CandidateProgramAdmin = {
  id: string
  title: string
  description: string
  category?: string
}

export type CandidateAdmin = {
  id: string
  number: number
  name: string
  faculty: string
  programStudi: string
  angkatan: string
  status: CandidateStatus
  photoUrl: string
  tagline?: string
  shortBio?: string
  longBio?: string
  visionTitle: string
  visionDescription: string
  missions: string[]
  programs: CandidateProgramAdmin[]
  media: CandidateMedia[]
  campaignVideo?: string
}
