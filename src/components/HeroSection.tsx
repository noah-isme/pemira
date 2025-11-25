import { useEffect, useMemo, useState, type JSX } from 'react'
import type { PublicElection } from '../services/publicElection'
import '../styles/HeroSection.css'

type Props = {
  election: PublicElection | null
  loading?: boolean
  error?: string | null
}

const FALLBACK_VOTING_DATE = (import.meta.env.VITE_FALLBACK_VOTING_START as string | undefined) ?? '2026-01-01T08:00:00+07:00'

type CountdownState = {
  days: number
  hours: number
  minutes: number
  seconds: number
  isPast: boolean
  target: Date
}

const statusLabelMap: Record<string, string> = {
  DRAFT: 'Pemilu disiapkan',
  REGISTRATION: 'Pendaftaran pemilih',
  REGISTRATION_OPEN: 'Pendaftaran pemilih',
  VERIFICATION: 'Verifikasi berkas',
  CAMPAIGN: 'Masa kampanye',
  QUIET_PERIOD: 'Masa tenang',
  VOTING: 'Voting dibuka',
  VOTING_OPEN: 'Voting dibuka',
  VOTING_CLOSED: 'Voting ditutup',
  RECAPITULATION: 'Rekapitulasi hasil',
  CLOSED: 'Pemilu selesai',
  ARCHIVED: 'Arsip',
}

const parseDate = (value?: string | null) => {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date
}

const resolveTargetDate = (election?: PublicElection | null): Date => {
  const now = Date.now()
  
  // Get phases from backend (now returns correct phases based on schedule)
  const phases = (election as any)?.phases as
    | Array<{ phase?: string; key?: string; start_at?: string | null; end_at?: string | null }>
    | undefined
  
  let votingStart: Date | null = null
  let votingEnd: Date | null = null
  
  if (phases?.length) {
    const votingPhase = phases.find((item) => {
      const key = (item.phase || item.key || '').toString().toLowerCase()
      return ['voting', 'voting_dibuka'].includes(key)
    })
    
    if (votingPhase) {
      votingStart = parseDate(votingPhase.start_at ?? (votingPhase as any).startAt)
      votingEnd = parseDate(votingPhase.end_at ?? (votingPhase as any).endAt)
    }
  }
  
  // Fallback to election voting dates
  if (!votingStart) votingStart = parseDate(election?.voting_start_at)
  if (!votingEnd) votingEnd = parseDate(election?.voting_end_at)

  // Before voting starts: countdown to start
  if (votingStart && votingStart.getTime() > now) return votingStart
  
  // During voting: countdown to end
  if (votingStart && votingEnd && now >= votingStart.getTime() && now <= votingEnd.getTime()) return votingEnd
  
  // After voting or no dates: fallback
  return parseDate(FALLBACK_VOTING_DATE) ?? new Date('2026-01-01T00:00:00Z')
}

const buildCountdown = (target: Date): CountdownState => {
  const now = Date.now()
  const diff = target.getTime() - now
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24)
  const minutes = Math.floor((diff / (1000 * 60)) % 60)
  const seconds = Math.floor((diff / 1000) % 60)

  return {
    days: Math.max(days, 0),
    hours: Math.max(hours, 0),
    minutes: Math.max(minutes, 0),
    seconds: Math.max(seconds, 0),
    isPast: diff <= 0,
    target,
  }
}

const HeroSection = ({ election, loading = false, error }: Props): JSX.Element => {
  const hasElection = Boolean(election)
  const isNoActiveElectionError = error?.toLowerCase().includes('pemilu aktif')
  const showNoElectionState = !hasElection && !loading
  const statusLabel = loading ? 'Memuat status...' : hasElection ? statusLabelMap[election?.status ?? ''] ?? 'Pemilu aktif' : 'Belum ada pemilu aktif'
  const votingPhase = useMemo(() => {
    const phases = (election as any)?.phases as
      | Array<{ phase?: string; key?: string; start_at?: string | null; end_at?: string | null }>
      | undefined
    if (!phases?.length) return undefined
    const match = phases.find((item) => {
      const key = (item.phase || item.key || '').toString().toLowerCase()
      return ['voting', 'voting_dibuka'].includes(key)
    })
    return match
  }, [election])
  const startDate = useMemo(
    () => parseDate(votingPhase?.start_at ?? (votingPhase as any)?.startAt ?? election?.voting_start_at),
    [election?.voting_start_at, votingPhase],
  )
  const endDate = useMemo(
    () => parseDate(votingPhase?.end_at ?? (votingPhase as any)?.endAt ?? election?.voting_end_at),
    [election?.voting_end_at, votingPhase],
  )
  const now = Date.now()
  const startMs = startDate?.getTime()
  const endMs = endDate?.getTime()
  const isBeforeVoting = Boolean(startMs !== undefined && now < startMs)
  const isVotingWindow = Boolean(startMs !== undefined && endMs !== undefined && now >= startMs && now <= endMs)
  const isAfterVoting = Boolean(endMs !== undefined && now > endMs)

  const derivedState: 'pre' | 'voting' | 'post' | 'unknown' = isBeforeVoting
    ? 'pre'
    : isVotingWindow
      ? 'voting'
      : isAfterVoting
        ? 'post'
        : 'unknown'

  const showLiveBadge = derivedState === 'voting'
  const primaryCtaLabel = 'Registrasi'
  const primaryCtaHref = '/register'
  const subtitle = 'Sistem pemilu kampus yang aman, rahasia, dan mudah digunakan oleh seluruh mahasiswa, dosen, dan staf UNIWA.'
  const friendlyError =
    !loading && error && !isNoActiveElectionError ? 'Data jadwal belum dapat dimuat. Panitia sedang memperbarui informasi.' : null
  const targetDate = useMemo(() => resolveTargetDate(election), [election])
  const [countdown, setCountdown] = useState<CountdownState>(() => buildCountdown(targetDate))

  useEffect(() => {
    let interval: number | undefined

    const tick = () => setCountdown(buildCountdown(targetDate))

    const startInterval = () => {
      if (interval) window.clearInterval(interval)
      tick()
      interval = window.setInterval(() => {
        if (document.visibilityState === 'hidden') return
        tick()
      }, 1000)
    }

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        if (interval) window.clearInterval(interval)
      } else {
        startInterval()
      }
    }

    startInterval()
    document.addEventListener('visibilitychange', handleVisibility)

    return () => {
      if (interval) window.clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibility)
    }
  }, [targetDate])

  const targetLabel = useMemo(
    () => targetDate.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }),
    [targetDate],
  )

  // Determine current phase based on timeline
  const getCurrentPhase = (): string => {
    if (loading) return 'Memuat status...'
    if (!hasElection) return 'Belum ada pemilu aktif'
    
    const phases = (election as any)?.phases as
      | Array<{ phase?: string; key?: string; start_at?: string | null; end_at?: string | null }>
      | undefined
    
    if (!phases?.length) {
      // Fallback to old logic
      if (isBeforeVoting) return 'Persiapan pemilihan'
      if (isVotingWindow) return 'Voting dibuka'
      if (isAfterVoting) return 'Voting ditutup'
      return statusLabel
    }
    
    // Find current phase based on timeline
    const now = Date.now()
    for (const phase of phases) {
      const startTime = parseDate(phase.start_at ?? (phase as any).startAt)?.getTime()
      const endTime = parseDate(phase.end_at ?? (phase as any).endAt)?.getTime()
      
      if (startTime && endTime && now >= startTime && now <= endTime) {
        const phaseKey = (phase.phase || phase.key || '').toString().toLowerCase()
        
        // Map phase keys to display labels
        if (phaseKey.includes('pendaftaran') || phaseKey.includes('registration')) return 'Pendaftaran pemilih'
        if (phaseKey.includes('verifikasi')) return 'Verifikasi berkas'
        if (phaseKey.includes('kampanye') || phaseKey.includes('campaign')) return 'Masa kampanye'
        if (phaseKey.includes('tenang')) return 'Masa tenang'
        if (phaseKey.includes('voting')) return 'Voting dibuka'
        if (phaseKey.includes('rekapitulasi')) return 'Rekapitulasi hasil'
        
        return phase.phase || phase.key || 'Pemilu berlangsung'
      }
    }
    
    // If before all phases
    if (phases[0]) {
      const firstPhaseStart = parseDate(phases[0].start_at ?? (phases[0] as any).startAt)?.getTime()
      if (firstPhaseStart && now < firstPhaseStart) return 'Persiapan pemilihan'
    }
    
    // If after all phases
    return 'Pemilu selesai'
  }

  const effectiveStatusLabel = getCurrentPhase()

  const displayCountdownTitle = derivedState === 'voting' ? 'Sisa waktu voting' : 'Menuju hari voting'
  const displayCountdownCaption =
    derivedState === 'voting' ? 'Pemilihan akan ditutup otomatis setelah waktu habis.' : 'Voting dimulai pada tanggal yang tertera.'

  return (
    <section className="hero" id="tentang">
      <div className="hero-container">
        <div className="hero-left">
          <div className="hero-brand">
            <span className="hero-brand-text">PEMIRA UNIWA 2025</span>
          </div>

          <h1 className="hero-title">Pemilihan Ketua BEM Universitas Wahidiyah</h1>

          <p className="hero-subtitle">{subtitle}</p>

          <div className="hero-badge">
            <span className="badge-status-dot">●</span>
            <span className="badge-status-text">{effectiveStatusLabel}</span>
          </div>

          {showNoElectionState ? (
            <div className="countdown-card no-election">
              <div className="no-election-icon">📋</div>
              <h3 className="no-election-title">Tidak ada pemilu aktif</h3>
              <p className="no-election-text">Panitia belum membuka jadwal resmi pemilihan.</p>
              {friendlyError && <p className="hero-error">{friendlyError}</p>}
            </div>
          ) : (
            <div className="countdown-card">
              <div className="countdown-header">
                <div className="countdown-header-left">
                  <div>
                    <h3 className="countdown-title">{displayCountdownTitle}</h3>
                    <p className="countdown-date">{targetLabel}</p>
                  </div>
                </div>
              {showLiveBadge && <span className="badge-live">● Sedang berlangsung</span>}
            </div>
              <div className="countdown-grid">
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.days.toString().padStart(2, '0')}</span>
                  <span className="countdown-unit">Hari</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.hours.toString().padStart(2, '0')}</span>
                  <span className="countdown-unit">Jam</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.minutes.toString().padStart(2, '0')}</span>
                  <span className="countdown-unit">Menit</span>
                </div>
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.seconds.toString().padStart(2, '0')}</span>
                  <span className="countdown-unit">Detik</span>
                </div>
              </div>
              <p className="countdown-caption">{displayCountdownCaption}</p>
              {friendlyError && <p className="hero-error">{friendlyError}</p>}
            </div>
          )}

          <div className="hero-cta">
            <a href={primaryCtaHref}>
              <button className="btn-primary btn-large">{primaryCtaLabel}</button>
            </a>
            <a href="/panduan">
              <button className="btn-outline btn-large">Panduan pemilihan</button>
            </a>
          </div>

          <div className="hero-note">
            <a className="hero-guide-link" href="#kandidat">
              Lihat calon & jadwal lengkap →
            </a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-illustration">
            <div className="election-timeline">
              <h3 className="timeline-title">Tahapan Pemilihan</h3>
              <div className="timeline-phases">
                <div className="timeline-phase active">
                  <div className="phase-dot"></div>
                  <div className="phase-content">
                    <h4 className="phase-title">Pendaftaran</h4>
                    <p className="phase-desc">01/11/2025 - 30/11/2025</p>
                  </div>
                </div>
                <div className="timeline-phase upcoming">
                  <div className="phase-dot"></div>
                  <div className="phase-content">
                    <h4 className="phase-title">Verifikasi Berkas</h4>
                    <p className="phase-desc">01/12/2025 - 07/12/2025</p>
                  </div>
                </div>
                <div className="timeline-phase upcoming">
                  <div className="phase-dot"></div>
                  <div className="phase-content">
                    <h4 className="phase-title">Kampanye</h4>
                    <p className="phase-desc">08/12/2025 - 10/12/2025</p>
                  </div>
                </div>
                <div className="timeline-phase upcoming">
                  <div className="phase-dot"></div>
                  <div className="phase-content">
                    <h4 className="phase-title">Masa Tenang</h4>
                    <p className="phase-desc">11/12/2025 - 14/12/2025</p>
                  </div>
                </div>
                <div className="timeline-phase upcoming">
                  <div className="phase-dot"></div>
                  <div className="phase-content">
                    <h4 className="phase-title">Voting</h4>
                    <p className="phase-desc">15/12/2025 - 17/12/2025</p>
                  </div>
                </div>
                <div className="timeline-phase upcoming">
                  <div className="phase-dot"></div>
                  <div className="phase-content">
                    <h4 className="phase-title">Rekapitulasi</h4>
                    <p className="phase-desc">21/12/2025 - 22/12/2025</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection
