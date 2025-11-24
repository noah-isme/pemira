import { useEffect, useRef, useState, type JSX } from 'react'
import { fetchPublicCandidates } from '../services/publicCandidates'
import { useVotingSession } from '../hooks/useVotingSession'
import { fetchPublicCandidateProfileMedia } from '../services/adminCandidateMedia'
import type { Candidate } from '../types/voting'
import '../styles/CandidatesPreview.css'

const CandidatesPreview = (): JSX.Element => {
  const { session } = useVotingSession()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [photoUrls, setPhotoUrls] = useState<Record<number, string>>({})
  const [error, setError] = useState<string | null>(null)
  const objectUrlsRef = useRef<string[]>([])

  const registerObjectUrl = (url: string) => {
    objectUrlsRef.current.push(url)
    return url
  }

  useEffect(() => {
    const controller = new AbortController()
    setError(null)
    fetchPublicCandidates({ signal: controller.signal, token: session?.accessToken ?? undefined })
      .then((items) => {
        setCandidates(items)
        setError(null)
      })
      .catch(() => {
        setError('Tidak dapat memuat data kandidat saat ini.')
        setCandidates([])
      })
    return () => controller.abort()
  }, [session?.accessToken])

  useEffect(() => {
    if (candidates.length === 0) return

    // Clear existing photo URLs to force re-fetch when candidates change
    setPhotoUrls({})

    const loadPhotos = async () => {
      for (const candidate of candidates) {
        try {
          // Use public endpoint - no authentication required
          const url = await fetchPublicCandidateProfileMedia(candidate.id)
          if (url) {
            setPhotoUrls((prev) => ({ ...prev, [candidate.id]: registerObjectUrl(url) }))
          }
        } catch (err) {
          // Silently fail - keep placeholder for candidates without photos
          console.debug(`Could not fetch photo for candidate ${candidate.id}:`, err)
        }
      }
    }
    void loadPhotos()
  }, [candidates])

  useEffect(
    () => () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
    },
    [],
  )

  return (
    <section className="candidates-preview" id="kandidat">
      <div className="candidates-container">
        <h2 className="section-title">Calon Ketua BEM</h2>
        <p className="section-subtitle">Kenali visi, misi, dan profil setiap kandidat sebelum menentukan pilihan Anda.</p>
        {error && <p className="error-text">{error}</p>}

        <div className="candidates-grid">
          {candidates.map((candidate) => (
            <div key={candidate.id} className="candidate-card">
              <div className="candidate-photo">
                {photoUrls[candidate.id] ? <img src={photoUrls[candidate.id]} alt={candidate.nama} /> : <div className="photo-placeholder">{candidate.nomorUrut}</div>}
              </div>
              <h3 className="candidate-name">{candidate.nama}</h3>
              <div className="candidate-number">No. Urut {candidate.nomorUrut}</div>
              <div className="candidate-info">
                {candidate.fakultas} {candidate.prodi && `– ${candidate.prodi}`} {candidate.angkatan ? `(Angkatan ${candidate.angkatan})` : ''}
              </div>
              <button className="btn-outline btn-small" onClick={() => (window.location.href = `/kandidat/detail/${candidate.id}`)}>
                Lihat Profil
              </button>
            </div>
          ))}
        </div>

        <div className="candidates-footer">
          <a href="/kandidat" className="link-view-all">
            Lihat semua kandidat →
          </a>
        </div>
      </div>
    </section>
  )
}

export default CandidatesPreview
