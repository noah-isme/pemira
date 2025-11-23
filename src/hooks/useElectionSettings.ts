import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { electionStatusOptions, initialBranding, initialElectionStatus, initialRules, initialTimeline, initialVotingMode } from '../data/electionSettings'
import { ACTIVE_ELECTION_ID } from '../config/env'
import { fetchAdminElection, updateAdminElection, type AdminElectionResponse, type AdminElectionUpdatePayload } from '../services/adminElection'
import { deleteBrandingLogo, fetchBranding, fetchBrandingLogo, uploadBrandingLogo, type BrandingMetadata } from '../services/adminBranding'
import { fetchCurrentElection } from '../services/publicElection'
import type { BrandingSettings, ElectionRules, ElectionStatus, TimelineStage, VotingMode } from '../types/electionSettings'
import type { ApiError } from '../utils/apiClient'
import { useAdminAuth } from './useAdminAuth'

const formatTimestamp = (value: string) => new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })

const formatInputDateTime = (value?: string | null) => {
  if (!value) return ''
  const date = new Date(value)
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

const mapModeFromFlags = (online?: boolean, tps?: boolean): VotingMode => {
  if (online && tps) return 'hybrid'
  if (online) return 'online'
  if (tps) return 'tps'
  return 'online'
}

const mapModeToFlags = (mode: VotingMode) => {
  if (mode === 'hybrid') return { online_enabled: true, tps_enabled: true }
  if (mode === 'tps') return { online_enabled: false, tps_enabled: true }
  return { online_enabled: true, tps_enabled: false }
}

const mapStatusFromApi = (status?: string): ElectionStatus => {
  switch ((status ?? '').toUpperCase()) {
    case 'REGISTRATION_OPEN':
    case 'REGISTRATION':
    case 'DRAFT':
      return 'pendaftaran'
    case 'CAMPAIGN':
      return 'kampanye'
    case 'VOTING_OPEN':
      return 'voting_dibuka'
    case 'VOTING_CLOSED':
    case 'CLOSED':
    case 'ARCHIVED':
      return 'voting_ditutup'
    default:
      return 'kampanye'
  }
}

type TimelineFieldKey =
  | 'registration_start_at'
  | 'registration_end_at'
  | 'verification_start_at'
  | 'verification_end_at'
  | 'campaign_start_at'
  | 'campaign_end_at'
  | 'quiet_start_at'
  | 'quiet_end_at'
  | 'recap_start_at'
  | 'recap_end_at'
  | 'voting_start_at'
  | 'voting_end_at'

const stageFieldMap: Record<
  TimelineStage['id'],
  {
    start?: TimelineFieldKey
    end?: TimelineFieldKey
  }
> = {
  pendaftaran: { start: 'registration_start_at', end: 'registration_end_at' },
  pemeriksaan: { start: 'verification_start_at', end: 'verification_end_at' },
  verifikasi: { start: 'verification_start_at', end: 'verification_end_at' },
  kampanye: { start: 'campaign_start_at', end: 'campaign_end_at' },
  masa_tenang: { start: 'quiet_start_at', end: 'quiet_end_at' },
  voting_dibuka: { start: 'voting_start_at', end: 'voting_end_at' },
  voting: { start: 'voting_start_at', end: 'voting_end_at' },
  rekapitulasi: { start: 'recap_start_at', end: 'recap_end_at' },
  selesai: {},
}

const toIsoOrNull = (value: string): string | null => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString()
}

export const useElectionSettings = () => {
  const { token } = useAdminAuth()
  const [currentElectionId, setCurrentElectionId] = useState<number>(ACTIVE_ELECTION_ID)
  const [status, setStatus] = useState<ElectionStatus>(initialElectionStatus)
  const [mode, setMode] = useState<VotingMode>(initialVotingMode)
  const [timeline, setTimeline] = useState<TimelineStage[]>(initialTimeline)
  const [rules, setRules] = useState<ElectionRules>(initialRules)
  const [branding, setBrandingState] = useState<BrandingSettings>(initialBranding)
  const [brandingUploads, setBrandingUploads] = useState<{ primary?: File; secondary?: File }>({})
  const [brandingRemoval, setBrandingRemoval] = useState<{ primary: boolean; secondary: boolean }>({ primary: false, secondary: false })
  const [security, setSecurity] = useState({ lockVoting: false })
  const [saving, setSaving] = useState<{ section: string | null }>({ section: null })
  const [lastUpdated, setLastUpdated] = useState('12 Juni 10:32 oleh Admin Dwi')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | undefined>(undefined)
  const brandingObjectUrlRef = useRef<{ primary?: string; secondary?: string }>({})

  const isModeChangeDisabled = status === 'voting_dibuka' || status === 'voting_ditutup'

  const applyElectionData = useCallback((election: AdminElectionResponse) => {
    setCurrentElectionId(election.id)
    setStatus(mapStatusFromApi(election.status))
    setMode(mapModeFromFlags(election.online_enabled, election.tps_enabled))
    setLastUpdated(formatTimestamp(election.updated_at ?? election.created_at ?? new Date().toISOString()))

    setTimeline((prev) =>
      prev.map((stage) => {
        const fields = stageFieldMap[stage.id]
        if (!fields) return stage
        const startVal = fields.start ? formatInputDateTime(election[fields.start]) : ''
        const endVal = fields.end ? formatInputDateTime(election[fields.end]) : ''
        return {
          ...stage,
          start: startVal ?? '',
          end: endVal ?? '',
        }
      }),
    )
  }, [])

  const revokeLogoUrl = useCallback((slot: 'primary' | 'secondary') => {
    const existing = brandingObjectUrlRef.current[slot]
    if (existing) {
      URL.revokeObjectURL(existing)
      brandingObjectUrlRef.current[slot] = undefined
    }
  }, [])

  const setBrandingPreview = useCallback(
    (slot: 'primary' | 'secondary', preview?: string, file?: File) => {
      const key = slot === 'primary' ? 'primaryLogo' : 'secondaryLogo'
      setBrandingState((prev) => ({ ...prev, [key]: preview }))
      setBrandingUploads((prev) => ({ ...prev, [slot]: file ?? undefined }))
      setBrandingRemoval((prev) => ({ ...prev, [slot]: false }))
    },
    [],
  )

  const markBrandingRemoval = useCallback(
    (slot: 'primary' | 'secondary') => {
      const key = slot === 'primary' ? 'primaryLogo' : 'secondaryLogo'
      setBrandingState((prev) => ({ ...prev, [key]: undefined }))
      setBrandingUploads((prev) => ({ ...prev, [slot]: undefined }))
      setBrandingRemoval((prev) => ({ ...prev, [slot]: true }))
      revokeLogoUrl(slot)
    },
    [revokeLogoUrl],
  )

  const resetBrandingDraft = useCallback(() => {
    markBrandingRemoval('primary')
    markBrandingRemoval('secondary')
  }, [markBrandingRemoval])

  const loadBrandingLogos = useCallback(
    async (meta: BrandingMetadata, electionId: number) => {
      if (!token) return

      const [primaryUrl, secondaryUrl] = await Promise.all([
        meta.primary_logo_id ? fetchBrandingLogo(token, 'primary', electionId).catch(() => null) : Promise.resolve(null),
        meta.secondary_logo_id ? fetchBrandingLogo(token, 'secondary', electionId).catch(() => null) : Promise.resolve(null),
      ])

      if (primaryUrl !== null) {
        revokeLogoUrl('primary')
        if (primaryUrl) brandingObjectUrlRef.current.primary = primaryUrl
      }
      if (secondaryUrl !== null) {
        revokeLogoUrl('secondary')
        if (secondaryUrl) brandingObjectUrlRef.current.secondary = secondaryUrl
      }

      setBrandingState({
        primaryLogo: primaryUrl || undefined,
        secondaryLogo: secondaryUrl || undefined,
      })
      setBrandingRemoval({ primary: false, secondary: false })
      setBrandingUploads({})
      if (meta.updated_at) {
        setLastUpdated(formatTimestamp(meta.updated_at))
      }
    },
    [revokeLogoUrl, token],
  )

  const fetchElectionWithFallback = useCallback(
    async (targetId: number) => {
      try {
        const election = await fetchAdminElection(token as string, targetId)
        return election
      } catch (err) {
        const apiErr = err as ApiError
        if (apiErr?.status === 404) {
          const current = await fetchCurrentElection()
          setCurrentElectionId(current.id)
          return fetchAdminElection(token as string, current.id)
        }
        throw err
      }
    },
    [token],
  )

  const refreshBranding = useCallback(
    async (targetId?: number) => {
      if (!token) {
        setBrandingState(initialBranding)
        setBrandingUploads({})
        setBrandingRemoval({ primary: false, secondary: false })
        revokeLogoUrl('primary')
        revokeLogoUrl('secondary')
        return
      }
      try {
        const electionId = targetId || currentElectionId || ACTIVE_ELECTION_ID
        const meta = await fetchBranding(token, electionId)
        await loadBrandingLogos(meta, electionId)
      } catch (err) {
        console.error('Failed to load branding', err)
        setError((err as { message?: string })?.message ?? 'Gagal memuat branding')
      }
    },
    [currentElectionId, loadBrandingLogos, revokeLogoUrl, token],
  )

  const refreshElection = useCallback(async () => {
    if (!token) return
    setLoading(true)
    setError(undefined)
    try {
      const election = await fetchElectionWithFallback(currentElectionId || ACTIVE_ELECTION_ID)
      applyElectionData(election)
      await refreshBranding(election.id)
    } catch (err) {
      console.error('Failed to load election settings', err)
      setError((err as { message?: string })?.message ?? 'Gagal memuat pengaturan pemilu')
    } finally {
      setLoading(false)
    }
  }, [applyElectionData, currentElectionId, fetchElectionWithFallback, refreshBranding, token])

  useEffect(() => {
    void refreshElection()
  }, [refreshElection])

  useEffect(() => {
    if (!token) {
      setBrandingState(initialBranding)
      setBrandingUploads({})
      setBrandingRemoval({ primary: false, secondary: false })
      revokeLogoUrl('primary')
      revokeLogoUrl('secondary')
    }
  }, [revokeLogoUrl, token])

  useEffect(
    () => () => {
      revokeLogoUrl('primary')
      revokeLogoUrl('secondary')
    },
    [revokeLogoUrl],
  )

  const handleTimelineChange = useCallback((id: TimelineStage['id'], field: 'start' | 'end', value: string) => {
    setTimeline((prev) => prev.map((stage) => (stage.id === id ? { ...stage, [field]: value } : stage)))
  }, [])

  const validateTimeline = useCallback(() => {
    for (let i = 0; i < timeline.length - 1; i += 1) {
      const currentEndValue = timeline[i].end
      const nextStartValue = timeline[i + 1].start
      if (!currentEndValue || !nextStartValue) continue
      const currentEnd = new Date(currentEndValue).getTime()
      const nextStart = new Date(nextStartValue).getTime()
      if (Number.isNaN(currentEnd) || Number.isNaN(nextStart)) continue
      if (currentEnd > nextStart) {
        return false
      }
    }
    return true
  }, [timeline])

  const saveSection = useCallback(async (section: string, callback: () => Promise<void> | void) => {
    setSaving({ section })
    setError(undefined)
    try {
      await callback()
      setLastUpdated(formatTimestamp(new Date().toISOString()))
    } catch (err) {
      console.error(`Failed to save section ${section}`, err)
      setError((err as { message?: string })?.message ?? 'Gagal menyimpan pengaturan')
      throw err
    } finally {
      setSaving({ section: null })
    }
  }, [])

  const saveMode = useCallback(async () => {
    await saveSection('mode', async () => {
      if (!token) return
      const payload = mapModeToFlags(mode)
      const updated = await updateAdminElection(token, payload, currentElectionId || ACTIVE_ELECTION_ID)
      applyElectionData(updated)
    })
  }, [applyElectionData, currentElectionId, mode, saveSection, token])

  const saveTimeline = useCallback(async () => {
    await saveSection('timeline', async () => {
      if (!token) return
      const payload: AdminElectionUpdatePayload = {}
      timeline.forEach((stage) => {
        const fields = stageFieldMap[stage.id]
        if (!fields) return
        if (fields.start) payload[fields.start] = toIsoOrNull(stage.start)
        if (fields.end) payload[fields.end] = toIsoOrNull(stage.end)
      })
      const updated = await updateAdminElection(token, payload, currentElectionId || ACTIVE_ELECTION_ID)
      applyElectionData(updated)
    })
  }, [applyElectionData, currentElectionId, saveSection, timeline, token])

  const saveRules = useCallback(async () => {
    await saveSection('rules', async () => {
      // Placeholder untuk integrasi aturan ketika endpoint tersedia.
      return
    })
  }, [saveSection])

  const saveBranding = useCallback(async () => {
    await saveSection('branding', async () => {
      if (!token) return
      const electionId = currentElectionId || ACTIVE_ELECTION_ID
      const operations: Promise<unknown>[] = []

      if (brandingRemoval.primary) {
        operations.push(deleteBrandingLogo(token, 'primary', electionId))
      }
      if (brandingRemoval.secondary) {
        operations.push(deleteBrandingLogo(token, 'secondary', electionId))
      }
      if (brandingUploads.primary) {
        operations.push(uploadBrandingLogo(token, 'primary', brandingUploads.primary, electionId))
      }
      if (brandingUploads.secondary) {
        operations.push(uploadBrandingLogo(token, 'secondary', brandingUploads.secondary, electionId))
      }

      if (operations.length) {
        await Promise.all(operations)
      }

      await refreshBranding(electionId)
    })
    setBrandingUploads({})
    setBrandingRemoval({ primary: false, secondary: false })
  }, [brandingRemoval.primary, brandingRemoval.secondary, brandingUploads.primary, brandingUploads.secondary, currentElectionId, refreshBranding, saveSection, token])

  const timelineValid = validateTimeline()

  const statusLabel = useMemo(() => electionStatusOptions.find((option) => option.value === status)?.label ?? '', [status])

  return {
    status,
    statusLabel,
    setStatus,
    mode,
    setMode,
    timeline,
    handleTimelineChange,
    timelineValid,
    rules,
    setRules,
    branding,
    setBranding: setBrandingPreview,
    queueBrandingUpload: setBrandingPreview,
    markBrandingRemoval,
    resetBrandingDraft,
    security,
    setSecurity,
    savingSection: saving.section,
    lastUpdated,
    isModeChangeDisabled,
    saveMode,
    saveTimeline,
    saveRules,
    saveBranding,
    loading,
    error,
    refreshElection,
  }
}
