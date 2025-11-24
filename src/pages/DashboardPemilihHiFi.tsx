import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVotingSession } from '../hooks/useVotingSession'
import '../styles/DashboardPemilihHiFi.css'

type PemiraStage = 'registration' | 'verification' | 'campaign' | 'silence' | 'voting' | 'rekapitulasi'
type VoterMode = 'ONLINE' | 'OFFLINE'
type VoterStatus = 'NOT_VOTED' | 'VOTED' | 'CHECKED_IN'

interface TimelineStage {
  id: PemiraStage
  label: string
  status: 'completed' | 'active' | 'upcoming'
  icon: string
}

interface VoterData {
  nama: string
  nim: string
  mode: VoterMode
  status: VoterStatus
  qrCode: string
  qrId: string
}

const DashboardPemilihHiFi = (): JSX.Element => {
  const navigate = useNavigate()
  const { session, mahasiswa } = useVotingSession()
  
  // Mock data - replace with actual API calls
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentStage, setCurrentStage] = useState<PemiraStage>('campaign')
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [voterData, setVoterData] = useState<VoterData>({
    nama: mahasiswa?.nama || 'Roni Saputra',
    nim: mahasiswa?.nim || '21034567',
    mode: 'ONLINE', // or 'OFFLINE'
    status: 'NOT_VOTED',
    qrCode: 'QR_CODE_DATA_HERE',
    qrId: 'OLF-98S7A1'
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [countdown, setCountdown] = useState({
    days: 1,
    hours: 3,
    minutes: 24
  })

  const timelineStages: TimelineStage[] = [
    { id: 'registration', label: 'Pendaftaran', status: 'completed', icon: '📝' },
    { id: 'verification', label: 'Verifikasi Berkas', status: 'completed', icon: '✓' },
    { id: 'campaign', label: 'Masa Kampanye', status: currentStage === 'campaign' ? 'active' : 'completed', icon: '📣' },
    { id: 'silence', label: 'Masa Tenang', status: currentStage === 'silence' ? 'active' : 'upcoming', icon: '🤫' },
    { id: 'voting', label: 'Voting', status: currentStage === 'voting' ? 'active' : 'upcoming', icon: '🗳️' },
    { id: 'rekapitulasi', label: 'Rekapitulasi', status: 'upcoming', icon: '📊' }
  ]

  const notifications = [
    { time: '10:12', message: 'Verifikasi berkas Anda telah disetujui.' },
    { time: 'Hari ini', message: 'Masa kampanye resmi dimulai.' },
    { time: 'Besok', message: 'Tahap voting akan dibuka pukul 08.00 WIB.' }
  ]

  useEffect(() => {
    if (!session) {
      navigate('/login', { replace: true })
    }
  }, [session, navigate])

  const handleStartVoting = () => {
    if (voterData.mode === 'ONLINE') {
      navigate('/voting')
    } else {
      // For offline, just show QR
      alert('Silakan datang ke TPS dan tunjukkan QR code Anda')
    }
  }

  const handleViewCandidates = () => {
    navigate('/kandidat')
  }

  const handleDownloadQR = () => {
    // Implement QR download
    alert('QR Code akan diunduh')
  }

  const handlePrintQR = () => {
    // Implement QR print
    window.print()
  }

  const renderMainPanel = () => {
    switch (currentStage) {
      case 'campaign':
        return (
          <div className="main-panel campaign-panel">
            <div className="panel-icon">📣</div>
            <h2>Saat ini adalah: MASA KAMPANYE</h2>
            <p>
              Anda dapat melihat profil lengkap seluruh pasangan calon.
              Gunakan waktu ini untuk mempelajari visi, misi, dan program kerja masing-masing paslon.
            </p>
            <button className="btn-primary-large" onClick={handleViewCandidates}>
              Lihat Daftar Paslon
            </button>
          </div>
        )

      case 'voting':
        if (voterData.status === 'VOTED') {
          return (
            <div className="main-panel success-panel">
              <div className="panel-icon success">✓</div>
              <h2>Anda sudah memberikan suara</h2>
              <p>Terima kasih atas partisipasi Anda dalam PEMIRA UNIWA!</p>
            </div>
          )
        }

        if (voterData.mode === 'ONLINE') {
          return (
            <div className="main-panel voting-panel online">
              <div className="panel-icon">🗳️</div>
              <h2>Tahap Voting telah dibuka!</h2>
              <p>Anda terdaftar sebagai <strong>PEMILIH ONLINE</strong>.</p>
              <p>Silakan memberikan suara melalui platform ini.</p>
              
              <div className="status-badge not-voted">
                Status: <strong>BELUM MEMILIH</strong>
              </div>

              <button className="btn-voting-start" onClick={handleStartVoting}>
                MULAI MEMILIH
              </button>
            </div>
          )
        } else {
          return (
            <div className="main-panel voting-panel offline">
              <div className="panel-icon">🗳️</div>
              <h2>Tahap Voting telah dibuka!</h2>
              <p>Anda terdaftar sebagai <strong>PEMILIH OFFLINE (TPS)</strong>.</p>
              <p>Silakan datang ke TPS terdekat sesuai jadwal.</p>
              
              <div className="qr-display">
                <p className="qr-label">Tunjukkan QR pendaftaran berikut:</p>
                <div className="qr-code-box">
                  <div className="qr-placeholder">
                    [QR CODE]
                  </div>
                  <div className="qr-id">ID: {voterData.qrId}</div>
                </div>
              </div>

              <div className="qr-actions">
                <button className="btn-secondary" onClick={handleDownloadQR}>
                  <span className="btn-icon">📥</span> Unduh QR
                </button>
                <button className="btn-secondary" onClick={handlePrintQR}>
                  <span className="btn-icon">🖨️</span> Cetak QR
                </button>
              </div>
            </div>
          )
        }

      case 'silence':
        return (
          <div className="main-panel silence-panel">
            <div className="panel-icon">🤫</div>
            <h2>Masa Tenang</h2>
            <p>Masa tenang sedang berlangsung. Tidak ada kampanye yang diperbolehkan.</p>
            <div className="countdown-box">
              <p>Voting dibuka dalam:</p>
              <div className="countdown-timer">
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.days.toString().padStart(2, '0')}</span>
                  <span className="countdown-label">Hari</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.hours.toString().padStart(2, '0')}</span>
                  <span className="countdown-label">Jam</span>
                </div>
                <div className="countdown-separator">:</div>
                <div className="countdown-item">
                  <span className="countdown-value">{countdown.minutes.toString().padStart(2, '0')}</span>
                  <span className="countdown-label">Menit</span>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return (
          <div className="main-panel default-panel">
            <div className="panel-icon">ℹ️</div>
            <h2>Dashboard PEMIRA UNIWA</h2>
            <p>Selamat datang di sistem pemilihan raya UNIWA.</p>
          </div>
        )
    }
  }

  const renderModePanel = () => {
    if (currentStage !== 'voting' || voterData.status === 'VOTED') return null

    if (voterData.mode === 'ONLINE') {
      return (
        <div className="mode-panel online-mode">
          <div className="mode-header">
            <span className="mode-icon">💻</span>
            <h3>Alur Pemilihan Online</h3>
          </div>
          
          <ol className="mode-steps">
            <li>Buka halaman kandidat ketika masa voting dibuka.</li>
            <li>Pilih salah satu pasangan calon.</li>
            <li>Konfirmasi pilihan.</li>
            <li>Selesai! Anda tidak dapat mengubah suara setelah submit.</li>
          </ol>

          <div className="mode-status">
            <span className="status-label">Status Anda:</span>
            <span className={`status-value ${voterData.status === 'NOT_VOTED' ? 'not-voted' : 'voted'}`}>
              {voterData.status === 'NOT_VOTED' ? 'BELUM MEMILIH' : 'SUDAH MEMILIH'}
            </span>
          </div>

          <button 
            className="btn-mode-action" 
            onClick={handleViewCandidates}
            disabled={currentStage !== 'voting'}
          >
            LIHAT KANDIDAT
          </button>
        </div>
      )
    } else {
      return (
        <div className="mode-panel offline-mode">
          <div className="mode-header">
            <span className="mode-icon">🏛️</span>
            <h3>Alur Pemilihan Offline (TPS)</h3>
          </div>
          
          <ol className="mode-steps">
            <li>Datang ke TPS sesuai jadwal.</li>
            <li>Tunjukkan QR pendaftaran Anda.</li>
            <li>Ambil surat suara dari panitia.</li>
            <li>Masuk bilik suara dan coblos pilihan Anda.</li>
            <li>Scan QR paslon melalui perangkat Anda sendiri.</li>
            <li>Masukkan surat suara ke kotak.</li>
          </ol>

          <div className="qr-section">
            <p className="qr-section-label">QR Pendaftaran Anda:</p>
            <div className="qr-code-display">
              <div className="qr-placeholder-small">
                [QR CODE]
              </div>
              <div className="qr-info">
                <span className="qr-id-label">ID:</span>
                <span className="qr-id-value">{voterData.qrId}</span>
              </div>
            </div>
            
            <div className="qr-action-buttons">
              <button className="btn-qr-action" onClick={handleDownloadQR}>
                <span className="btn-icon">📥</span> Unduh QR
              </button>
              <button className="btn-qr-action" onClick={handlePrintQR}>
                <span className="btn-icon">🖨️</span> Cetak QR
              </button>
            </div>
          </div>
        </div>
      )
    }
  }

  return (
    <div className="dashboard-pemilih-page">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <div className="logo-pemira">
              <span className="logo-icon">🗳️</span>
              <span className="logo-text">PEMIRA UNIWA</span>
            </div>
          </div>
          
          <div className="header-right">
            <button className="profile-button">
              <span className="profile-icon">👤</span>
            </button>
          </div>
        </div>

        <div className="user-info">
          <h1 className="user-greeting" style={{ color: '#FFFFFF' }}>Halo, {voterData.nama}!</h1>
          <p className="user-details" style={{ color: '#FFFFFF' }}>
            <span className="user-nim" style={{ color: '#FFFFFF' }}>NIM {voterData.nim}</span>
            <span className="user-mode-badge" data-mode={voterData.mode.toLowerCase()} style={{ color: '#FFFFFF' }}>
              Mode: {voterData.mode === 'ONLINE' ? 'ONLINE' : 'OFFLINE (TPS)'}
            </span>
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="dashboard-main">
        <div className="dashboard-container">
          {/* Timeline Section */}
          <section className="timeline-section">
            <h2 className="section-title">
              <span className="section-icon">📍</span>
              Status PEMIRA
            </h2>
            
            <div className="timeline-container">
              {timelineStages.map((stage, index) => (
                <div 
                  key={stage.id}
                  className={`timeline-stage ${stage.status}`}
                  style={{ '--stage-index': index } as React.CSSProperties}
                >
                  <div className="stage-indicator">
                    <div className="stage-dot" />
                    {index < timelineStages.length - 1 && (
                      <div className="stage-line" />
                    )}
                  </div>
                  
                  <div className="stage-content">
                    <div className="stage-icon">{stage.icon}</div>
                    <div className="stage-info">
                      <h3 className="stage-label">{stage.label}</h3>
                      <span className="stage-status-text">
                        {stage.status === 'completed' && 'Selesai ✓'}
                        {stage.status === 'active' && 'Sedang berlangsung'}
                        {stage.status === 'upcoming' && 'Belum dibuka'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="current-stage-info">
              <span className="current-stage-label">Tahap saat ini:</span>
              <span className="current-stage-value">
                {timelineStages.find(s => s.status === 'active')?.label.toUpperCase()}
              </span>
            </div>
          </section>

          {/* Main Panel */}
          <section className="panel-section">
            {renderMainPanel()}
          </section>

          {/* Mode Panel */}
          {renderModePanel()}

          {/* Notifications */}
          <section className="notifications-section">
            <h2 className="section-title">
              <span className="section-icon">🔔</span>
              Notifikasi
            </h2>
            
            <div className="notifications-list">
              {notifications.map((notif, index) => (
                <div key={index} className="notification-item" style={{ '--notif-index': index } as React.CSSProperties}>
                  <span className="notification-time">[{notif.time}]</span>
                  <span className="notification-message">{notif.message}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>

      {/* Footer Navigation */}
      <footer className="dashboard-footer">
        <nav className="footer-nav">
          <button className="nav-item active">
            <span className="nav-icon">🏠</span>
            <span className="nav-label">Beranda</span>
          </button>
          <button className="nav-item" onClick={handleViewCandidates}>
            <span className="nav-icon">👥</span>
            <span className="nav-label">Kandidat</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon">📜</span>
            <span className="nav-label">Riwayat</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon">❓</span>
            <span className="nav-label">Bantuan</span>
          </button>
          <button className="nav-item">
            <span className="nav-icon">👤</span>
            <span className="nav-label">Profil</span>
          </button>
        </nav>
      </footer>
    </div>
  )
}

export default DashboardPemilihHiFi
