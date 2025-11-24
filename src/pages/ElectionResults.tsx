import { useEffect, useState } from 'react'
import PageHeader from '../components/shared/PageHeader'
import { useVotingSession } from '../hooks/useVotingSession'
import '../styles/ElectionResults.css'

type CandidateResult = {
  id: number
  nomorUrut: number
  nama: string
  totalVotes: number
  percentage: number
  isWinner: boolean
}

type FacultyResult = {
  fakultas: string
  winner: string
  detail: string
}

type ElectionResultsData = {
  totalVotes: number
  candidates: CandidateResult[]
  facultyResults: FacultyResult[]
  publishedAt: string
}

const mockResultsData: ElectionResultsData = {
  totalVotes: 6822,
  candidates: [
    {
      id: 1,
      nomorUrut: 1,
      nama: 'Ahmad & Siti',
      totalVotes: 3010,
      percentage: 44,
      isWinner: false,
    },
    {
      id: 2,
      nomorUrut: 2,
      nama: 'Budi & Rian',
      totalVotes: 3812,
      percentage: 56,
      isWinner: true,
    },
  ],
  facultyResults: [
    { fakultas: 'FTI', winner: 'Paslon 02', detail: 'unggul' },
    { fakultas: 'FIKES', winner: 'Paslon 01', detail: 'unggul tipis' },
    { fakultas: 'FEBI', winner: 'Paslon 02', detail: 'unggul' },
    { fakultas: 'FKIP', winner: 'Paslon 02', detail: 'unggul' },
  ],
  publishedAt: '15 Juni 2024, 14:30 WIB',
}

const ElectionResults = (): JSX.Element => {
  const { mahasiswa } = useVotingSession()
  const [results, setResults] = useState<ElectionResultsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate API fetch
    setTimeout(() => {
      setResults(mockResultsData)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleDownloadPDF = () => {
    alert('Download PDF Rekapitulasi - Feature coming soon')
  }

  if (isLoading) {
    return (
      <div className="results-page">
        <PageHeader title="Hasil Akhir PEMIRA UNIWA" user={mahasiswa} />
        <main className="results-main">
          <div className="loading-spinner">
            <div className="spinner" />
            <p>Memuat hasil pemilihan...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!results) {
    return (
      <div className="results-page">
        <PageHeader title="Hasil Akhir PEMIRA UNIWA" user={mahasiswa} />
        <main className="results-main">
          <div className="no-results">
            <p>Hasil pemilihan belum tersedia.</p>
          </div>
        </main>
      </div>
    )
  }

  const winner = results.candidates.find((c) => c.isWinner)

  return (
    <div className="results-page">
      <PageHeader title="Hasil Akhir PEMIRA UNIWA" user={mahasiswa} />

      <main className="results-main">
        <div className="results-container">
          {/* Winner Announcement */}
          <div className="winner-section">
            <div className="trophy-icon">🏆</div>
            <h1>Pasangan Terpilih</h1>
            {winner && (
              <>
                <div className="winner-name">
                  PASLON {winner.nomorUrut.toString().padStart(2, '0')} — {winner.nama}
                </div>
                <div className="winner-votes">
                  Perolehan: {winner.totalVotes.toLocaleString('id-ID')} Suara ({winner.percentage}%)
                </div>
              </>
            )}
          </div>

          {/* Vote Rekapitulation */}
          <div className="rekapitulasi-section">
            <h2>
              <span className="section-icon">📊</span>
              Rekapitulasi Suara
            </h2>
            <div className="rekapitulasi-content">
              {results.candidates.map((candidate) => (
                <div key={candidate.id} className="candidate-result-row">
                  <div className="candidate-result-label">
                    PASLON {candidate.nomorUrut.toString().padStart(2, '0')}
                  </div>
                  <div className="candidate-result-bar-container">
                    <div
                      className={`candidate-result-bar ${candidate.isWinner ? 'winner' : ''}`}
                      style={{ width: `${candidate.percentage}%` }}
                    />
                  </div>
                  <div className="candidate-result-stats">
                    {candidate.percentage}% ({candidate.totalVotes.toLocaleString('id-ID')} suara)
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Faculty Results */}
          <div className="faculty-section">
            <h2>
              <span className="section-icon">📍</span>
              Persebaran Suara per Fakultas
            </h2>
            <div className="faculty-grid">
              {results.facultyResults.map((faculty, index) => (
                <div key={index} className="faculty-card">
                  <div className="faculty-name">{faculty.fakultas}</div>
                  <div className="faculty-winner">
                    {faculty.winner} <span className="faculty-detail">{faculty.detail}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Download PDF */}
          <div className="download-section">
            <h3>
              <span className="section-icon">📥</span>
              Unduh Dokumen Resmi Rekapitulasi (PDF)
            </h3>
            <button className="btn-download" onClick={handleDownloadPDF}>
              DOWNLOAD PDF
            </button>
          </div>

          {/* Publish Info */}
          <div className="publish-info">
            <p>Hasil dipublikasikan pada: {results.publishedAt}</p>
          </div>
        </div>
      </main>
    </div>
  )
}

export default ElectionResults
