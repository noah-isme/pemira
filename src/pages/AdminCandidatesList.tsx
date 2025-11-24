import { useEffect, useMemo, useRef, useState, type JSX } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import { useCandidateAdminStore } from '../hooks/useCandidateAdminStore'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { usePopup } from '../components/Popup'
import { fetchCandidateProfileMedia } from '../services/adminCandidateMedia'
import type { CandidateStatus } from '../types/candidateAdmin'
import '../styles/AdminCandidates.css'

const statusOptions: { value: CandidateStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Semua Status' },
  { value: 'PENDING', label: 'Menunggu Review' },
  { value: 'APPROVED', label: 'Disetujui' },
  { value: 'REJECTED', label: 'Ditolak' },
  { value: 'WITHDRAWN', label: 'Ditarik' },
]

const AdminCandidatesList = (): JSX.Element => {
  const navigate = useNavigate()
  const { token } = useAdminAuth()
  const { candidates, archiveCandidate, refresh, loading, error } = useCandidateAdminStore()
  const { showPopup } = usePopup()
  const [search, setSearch] = useState('')
  const [facultyFilter, setFacultyFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<CandidateStatus | 'all'>('all')
  const [photoUrls, setPhotoUrls] = useState<Record<string, string>>({})
  const objectUrlsRef = useRef<string[]>([])

  const registerObjectUrl = (url: string) => {
    objectUrlsRef.current.push(url)
    return url
  }

  const candidatesToFetch = useMemo(
    () =>
      candidates.filter(
        (candidate) => candidate.photoUrl && candidate.photoUrl.startsWith('http') && !photoUrls[candidate.id]
      ),
    [candidates, photoUrls]
  )

  useEffect(() => {
    if (!token || candidatesToFetch.length === 0) return

    const loadPhotos = async () => {
      for (const candidate of candidatesToFetch) {
        try {
          const url = await fetchCandidateProfileMedia(token, candidate.id)
          if (url) {
            setPhotoUrls((prev) => ({ ...prev, [candidate.id]: registerObjectUrl(url) }))
          }
        } catch (err) {
          console.error(`Failed to fetch photo for candidate ${candidate.id}`, err)
        }
      }
    }
    void loadPhotos()
  }, [candidatesToFetch, token])

  useEffect(
    () => () => {
      objectUrlsRef.current.forEach((url) => URL.revokeObjectURL(url))
      objectUrlsRef.current = []
    },
    [],
  )

  const facultyOptions = useMemo(() => {
    const faculties = Array.from(new Set(candidates.map((candidate) => candidate.faculty)))
    return ['all', ...faculties]
  }, [candidates])

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const matchesSearch = candidate.name.toLowerCase().includes(search.toLowerCase())
      const matchesFaculty = facultyFilter === 'all' || candidate.faculty === facultyFilter
      const matchesStatus = statusFilter === 'all' || candidate.status === statusFilter
      return matchesSearch && matchesFaculty && matchesStatus
    })
  }, [candidates, facultyFilter, search, statusFilter])

  const handleArchive = async (id: string) => {
    const confirmed = await showPopup({
      title: 'Arsipkan Kandidat',
      message: 'Arsipkan kandidat ini?',
      type: 'warning',
      confirmText: 'Arsipkan',
      cancelText: 'Batal'
    })
    if (!confirmed) return
    archiveCandidate(id)
  }

  return (
    <AdminLayout title="Manajemen Kandidat">
      <div className="admin-candidates-page">
        <div className="page-header">
          <div>
            <h1>Manajemen Kandidat</h1>
            <p>Kelola seluruh calon ketua BEM, termasuk foto, profil, visi-misi, dan program kerja.</p>
          </div>
          <button className="btn-primary" type="button" onClick={() => navigate('/admin/kandidat/tambah')}>
            + Tambah Kandidat
          </button>
        </div>

        <div className="filters">
          <div className="status-row">
            {loading && <span>Memuat kandidat...</span>}
            {error && <span className="error-text">{error}</span>}
            <button className="btn-outline" type="button" onClick={() => void refresh()}>
              Muat ulang
            </button>
          </div>
          <input
            type="search"
            placeholder="Cari nama kandidat"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={facultyFilter} onChange={(event) => setFacultyFilter(event.target.value)}>
            {facultyOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'Semua Fakultas' : option}
              </option>
            ))}
          </select>
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as CandidateStatus | 'all')}>
            {statusOptions.map((statusOption) => (
              <option key={statusOption.value} value={statusOption.value}>
                {statusOption.label}
              </option>
            ))}
          </select>
        </div>

        <div className="table-wrapper">
          <table className="candidates-table">
            <thead>
              <tr>
                <th>Foto</th>
                <th>No</th>
                <th>Nama</th>
                <th>Fakultas</th>
                <th>Status</th>
                <th>Konten</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredCandidates.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    Belum ada kandidat yang cocok.
                  </td>
                </tr>
              )}
              {filteredCandidates.map((candidate) => {
                const contentCount = candidate.missions.length + candidate.programs.length + (candidate.visionTitle ? 1 : 0)
                return (
                  <tr key={candidate.id}>
                    <td>
                      {(candidate.photoUrl && photoUrls[candidate.id]) ? (
                        <img src={photoUrls[candidate.id]} alt={candidate.name} className="candidate-thumb" />
                      ) : (
                        <div className="candidate-thumb placeholder">?</div>
                      )}
                    </td>
                    <td>{candidate.number.toString().padStart(2, '0')}</td>
                    <td>
                      <div className="candidate-name">
                        <strong>{candidate.name}</strong>
                        <span>{candidate.programStudi}</span>
                      </div>
                    </td>
                    <td>{candidate.faculty}</td>
                    <td>
                      <span className={`status-chip ${candidate.status}`}>
                        {candidate.status === 'APPROVED'
                          ? 'Disetujui'
                          : candidate.status === 'PENDING'
                            ? 'Menunggu Review'
                            : candidate.status === 'REJECTED'
                              ? 'Ditolak'
                              : 'Ditarik'}
                      </span>
                    </td>
                    <td>{contentCount} item</td>
                    <td>
                      <div className="table-actions">
                        <button className="btn-table" type="button" onClick={() => navigate(`/admin/kandidat/${candidate.id}/edit`)}>
                          Edit
                        </button>
                        <button className="btn-table" type="button" onClick={() => navigate(`/admin/kandidat/${candidate.id}/preview`)}>
                          Preview
                        </button>
                        <button className="btn-table danger" type="button" onClick={() => handleArchive(candidate.id)}>
                          Arsipkan
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminCandidatesList
