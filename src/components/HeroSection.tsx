import { useEffect, useState } from 'react'
import '../styles/HeroSection.css'

type HeroData = {
  statusLabel: string
  period: string
  totalVoters: string
  mode: string
}

const HeroSection = (): JSX.Element => {
  const [heroData] = useState<HeroData>({
    statusLabel: 'Voting Aktif',
    period: '12–15 Juni',
    totalVoters: '—',
    mode: 'Online & TPS',
  })

  return (
    <section className="hero">
      <div className="hero-container">
        <div className="hero-left">
          <h1 className="hero-title">
            Pemilihan Ketua BEM
            <br />
            Universitas Wahidiyah
          </h1>

          <p className="hero-subtitle">
            Sistem pemilu kampus yang aman, transparan, dan modern.
          </p>

          <div className="hero-badge">
            <span className="badge-status">Status: {heroData.statusLabel}</span>
          </div>

          <div className="hero-info">
            <div className="info-item">
              <span className="info-label">Periode Voting:</span>
              <span className="info-value">{heroData.period}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Total Pemilih Terdaftar:</span>
              <span className="info-value">{heroData.totalVoters} Mahasiswa</span>
            </div>
            <div className="info-item">
              <span className="info-label">Mode:</span>
              <span className="info-value">{heroData.mode}</span>
            </div>
          </div>

          <div className="hero-cta">
            <a href="/login">
              <button className="btn-primary btn-large">Masuk untuk Memilih</button>
            </a>
            <a href="#kandidat">
              <button className="btn-outline btn-large">Lihat Kandidat</button>
            </a>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-illustration">
            <div className="card-mockup">
              <div className="mockup-header">Kandidat BEM 2024</div>
              <div className="mockup-cards">
                <div className="mockup-card">
                  <div className="mockup-avatar" />
                  <div className="mockup-text" />
                </div>
                <div className="mockup-card">
                  <div className="mockup-avatar" />
                  <div className="mockup-text" />
                </div>
                <div className="mockup-card">
                  <div className="mockup-avatar" />
                  <div className="mockup-text" />
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
