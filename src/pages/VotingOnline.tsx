import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import PageHeader from '../components/shared/PageHeader'
import { mockCandidates } from '../data/mockCandidates'
import { useVotingSession } from '../hooks/useVotingSession'
import type { Candidate, VotingReceipt } from '../types/voting'
import '../styles/VotingOnline.css'

type VotingStep = 1 | 2 | 3

const formatToken = (): string => {
  const token = Math.random().toString(36).slice(2, 14)
  return `${token.slice(0, 4)}-${token.slice(4, 8)}-${token.slice(8, 12)}`
}

const VotingOnline = (): JSX.Element => {
  const { session, mahasiswa, updateSession } = useVotingSession()
  const [step, setStep] = useState<VotingStep>(1)
  const [selectedKandidat, setSelectedKandidat] = useState<Candidate | null>(null)
  const [checkboxConfirm, setCheckboxConfirm] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [votingResult, setVotingResult] = useState<VotingReceipt | null>(null)

  const votingStatus = session?.votingStatus ?? 'open'
  const hasVoted = session?.hasVoted ?? false

  useEffect(() => {
    if (hasVoted && step !== 3) {
      setStep(3)
      setVotingResult({
        timestamp: '14 Juni 2024 — 10:24 WIB',
        token: 'x81c-a91b-d33f',
      })
    }
  }, [hasVoted, step])

  const handleSelectKandidat = (kandidat: Candidate) => {
    if (selectedKandidat?.id === kandidat.id) {
      setSelectedKandidat(null)
    } else {
      setSelectedKandidat(kandidat)
      setTimeout(() => setStep(2), 300)
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleLanjutKonfirmasi = () => {
    if (!selectedKandidat) return
    setStep(2)
    setCheckboxConfirm(false)
  }

  const handleKembali = () => {
    if (step === 2) {
      setStep(1)
      setCheckboxConfirm(false)
    }
  }

  const handleKirimSuara = () => {
    if (!checkboxConfirm || isSubmitting || !selectedKandidat) return

    setIsSubmitting(true)

    setTimeout(() => {
      const timestamp = new Date().toLocaleString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })

      setVotingResult({
        timestamp,
        token: formatToken(),
      })

      updateSession({ hasVoted: true, votingStatus: 'voted' })
      setIsSubmitting(false)
      setStep(3)
    }, 2000)
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  if (votingStatus === 'not_started') {
    return (
      <div className="voting-page">
        <PageHeader title='Pemungutan Suara' user={mahasiswa} />
        <main className="voting-main">
          <div className="voting-container">
            <div className="status-block status-info">
              <div className="status-icon">ℹ️</div>
              <div className="status-content">
                <h2>Voting Belum Dibuka</h2>
                <p>Silakan kembali pada tanggal 12 Juni 2024 pukul 00:00 WIB</p>
                <Link to="/dashboard">
                  <button className="btn-secondary">Kembali ke Dashboard</button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (votingStatus === 'closed') {
    return (
      <div className="voting-page">
        <PageHeader title='Pemungutan Suara' user={mahasiswa} />
        <main className="voting-main">
          <div className="voting-container">
            <div className="status-block status-closed">
              <div className="status-icon">🔒</div>
              <div className="status-content">
                <h2>Voting Telah Ditutup</h2>
                <p>Terima kasih atas partisipasi Anda dalam PEMIRA UNIWA 2024</p>
                <Link to="/dashboard">
                  <button className="btn-secondary">Kembali ke Dashboard</button>
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="voting-page">
      <PageHeader title='🗳 PEMILIHAN ONLINE - PEMIRA UNIWA' user={mahasiswa} />

      <main className="voting-main">
        <div className="voting-container">
          {step === 1 && (
            <div className="voting-status-bar">
              <div className="status-item">
                <span className="status-label">Status Pemilih:</span>
                <span className="status-value status-belum">{hasVoted ? 'SUDAH MEMILIH' : 'BELUM MEMILIH'}</span>
              </div>
              <div className="status-item">
                <span className="status-label">Waktu Tersisa:</span>
                <span className="status-value status-timer">02:31:58</span>
              </div>
            </div>
          )}

          <div className="progress-steps">
            <div className={`step-item ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="step-number">1</div>
              <div className="step-label">Pilih Kandidat</div>
            </div>
            <div className="step-line" />
            <div className={`step-item ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="step-number">2</div>
              <div className="step-label">Konfirmasi</div>
            </div>
            <div className="step-line" />
            <div className={`step-item ${step >= 3 ? 'active' : ''}`}>
              <div className="step-number">3</div>
              <div className="step-label">Selesai</div>
            </div>
          </div>

          {step === 1 && (
            <div className="voting-step">
              <div className="step-header">
                <h1 className="step-title">Pilih pasangan calon Anda:</h1>
              </div>

              <div className="kandidat-voting-grid">
                {mockCandidates.map((kandidat) => (
                  <div
                    key={kandidat.id}
                    className={`kandidat-voting-card ${selectedKandidat?.id === kandidat.id ? 'selected' : ''
                      }`}
                    onClick={() => handleSelectKandidat(kandidat)}
                  >
                    <div className="kandidat-hero">
                      <div className="kandidat-photo">
                        <img
                          src={`https://ui-avatars.com/api/?name=${encodeURIComponent(kandidat.nama)}&size=300&background=random`}
                          alt={kandidat.nama}
                        />
                      </div>
                      <div className="kandidat-info">
                        <div className="candidate-number">PASLON {kandidat.nomorUrut.toString().padStart(2, '0')}</div>
                        <h3>{kandidat.nama}</h3>
                        <p className="visi-ringkas">Visi & Misi: Membangun kampus yang inklusif dan berprestasi</p>
                      </div>
                    </div>
                    <button
                      className={`btn-select ${selectedKandidat?.id === kandidat.id ? 'selected' : ''}`}
                      type="button"
                    >
                      {selectedKandidat?.id === kandidat.id ? '✓ Dipilih' : 'PILIH'}
                    </button>
                  </div>
                ))}
              </div>

              <div className="voting-actions">
                <Link to="/dashboard">
                  <button className="btn-secondary">Kembali ke Dashboard</button>
                </Link>
              </div>
            </div>
          )}

          {step === 2 && selectedKandidat && (
            <div className="voting-step">
              <div className="confirmation-modal">
                <div className="confirmation-header">
                  <h2>Konfirmasi Pilihan</h2>
                </div>
                <div className="confirmation-body">
                  <p className="confirmation-text">
                    Anda memilih <strong>PASLON {selectedKandidat.nomorUrut.toString().padStart(2, '0')}</strong>.
                  </p>
                  <p className="confirmation-warning">
                    Setelah mengirim, suara tidak dapat diubah.
                  </p>
                </div>

                <div className="confirmation-actions">
                  <button className="btn-secondary" onClick={handleKembali}>
                    BATAL
                  </button>
                  <button
                    className="btn-primary"
                    onClick={handleKirimSuara}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Mengirim...' : 'KIRIM SUARA'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {step === 3 && votingResult && (
            <div className="voting-result">
              <div className="result-card">
                <div className="result-icon">🎉</div>
                <h2>Terima Kasih!</h2>
                <p>Suara Anda telah dicatat dalam sistem PEMIRA UNIWA.</p>
                <div className="result-info">
                  <div className="info-row">
                    <span className="info-label">Waktu Voting</span>
                    <span className="info-value">{votingResult.timestamp}</span>
                  </div>
                  <div className="info-row">
                    <span className="info-label">Token Bukti</span>
                    <span className="info-value token">{votingResult.token}</span>
                  </div>
                </div>
                <Link to="/dashboard">
                  <button className="btn-primary">Kembali ke Dashboard</button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default VotingOnline
