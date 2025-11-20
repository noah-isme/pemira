import { useCallback, useMemo, useState } from 'react'
import { getVoterProfileByNim } from '../data/mockVoters'
import type { AuthResponse } from '../services/auth'
import type { VoterProfile, VoterSession, VotingStatus } from '../types/voting'

const fallbackProfile: VoterProfile = {
  nama: 'Ahmad Fauzi',
  nim: '2110510023',
  fakultas: 'Fakultas Teknik',
}

export type AuthenticatedSession = {
  accessToken: string
  refreshToken?: string
  user: {
    id: number
    username: string
    role: string
    voterId?: number
    profile?: {
      name?: string
      faculty_name?: string
      study_program_name?: string
      cohort_year?: number
    }
  }
  votingStatus?: VotingStatus
  hasVoted?: boolean
}

const readSession = (): AuthenticatedSession | null => {
  if (typeof window === 'undefined') return null
  const raw = window.sessionStorage.getItem('currentUser')
  if (!raw) return null

  try {
    return JSON.parse(raw) as AuthenticatedSession
  } catch {
    return null
  }
}

const persistSession = (value: AuthenticatedSession | null) => {
  if (typeof window === 'undefined') return
  if (value) {
    window.sessionStorage.setItem('currentUser', JSON.stringify(value))
  } else {
    window.sessionStorage.removeItem('currentUser')
  }
}

export const useVotingSession = () => {
  const [session, setSession] = useState<AuthenticatedSession | null>(() => readSession())

  const setSessionAndPersist = useCallback((value: AuthenticatedSession | null) => {
    persistSession(value)
    setSession(value)
  }, [])

  const refreshSession = useCallback(() => {
    setSession(readSession())
  }, [])

  const updateSession = useCallback((updates: Partial<AuthenticatedSession>) => {
    setSession((prev) => {
      if (!prev) return prev
      const next: AuthenticatedSession = { ...prev, ...updates }
      persistSession(next)
      return next
    })
  }, [])

  const clearSession = useCallback(() => {
    setSessionAndPersist(null)
  }, [setSessionAndPersist])

  const mahasiswa = useMemo<VoterProfile>(() => {
    if (!session) return fallbackProfile
    const profile = session.user.profile
    if (profile) {
      return {
        nama: profile.name ?? session.user.username,
        nim: session.user.username,
        fakultas: profile.faculty_name,
        prodi: profile.study_program_name,
      }
    }
    return getVoterProfileByNim(session.user.username) ?? fallbackProfile
  }, [session])

  return {
    session,
    hasSession: Boolean(session),
    mahasiswa,
    updateSession,
    refreshSession,
    clearSession,
    setSession: setSessionAndPersist,
  }
}
