import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useDPTAdminStore } from '../hooks/useDPTAdminStore'
import { deleteAdminDptVoter } from '../services/adminDpt'
import { updateElectionVoter } from '../services/adminElectionVoters'
import { useActiveElection } from '../hooks/useActiveElection'
import { useToast } from '../components/Toast'
import { usePopup } from '../components/Popup'
import type { AcademicStatus, VoterStatus, ElectionVoterStatus } from '../types/dptAdmin'
import '../styles/AdminDPT.css'

const statusSuaraLabels: Record<VoterStatus, string> = {
  belum: 'Belum',
  sudah: 'Sudah',
}

const akademikLabels: Record<AcademicStatus, string> = {
  aktif: 'Aktif',
  cuti: 'Cuti',
  nonaktif: 'Nonaktif',
}

const electionVoterStatusLabels: Record<ElectionVoterStatus, string> = {
  PENDING: 'Menunggu Verifikasi',
  VERIFIED: 'Terverifikasi',
  REJECTED: 'Ditolak',
  VOTED: 'Sudah Memilih',
  BLOCKED: 'Diblokir',
}

const AdminDPTList = (): JSX.Element => {
  const navigate = useNavigate()
  const location = useLocation()
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const { voters, total, page, limit, setPage, filters, setFilters, selected, toggleSelect, selectAll, clearSelection, refresh, loading, error } = useDPTAdminStore()
  const [deleting, setDeleting] = useState(false)
  const [updating, setUpdating] = useState(false)
  const { showToast } = useToast()
  const { showPopup } = usePopup()

  // Refresh data when component mounts or when returning from edit page
  useEffect(() => {
    if (token) {
      void refresh()
    }
  }, [token, refresh])

  // Refresh data when returning from edit page with refresh flag
  useEffect(() => {
    if (location.state?.refresh && token) {
      void refresh()
      // Clear the state to prevent infinite refresh
      navigate(location.pathname, { replace: true, state: {} })
    }
  }, [location.state?.refresh, token, refresh, navigate, location.pathname])

  const fakultasOptions = useMemo(() => ['all', ...new Set(voters.map((voter) => voter.fakultas))], [voters])
  const angkatanOptions = useMemo(() => ['all', ...new Set(voters.map((voter) => voter.angkatan))], [voters])

  const filteredVoters = useMemo(() => {
    return voters.filter((voter) => {
      const matchesSearch = [voter.nim, voter.nama, voter.prodi].some((value) => value.toLowerCase().includes(filters.search.toLowerCase()))
      const matchesFakultas = filters.fakultas === 'all' || voter.fakultas === filters.fakultas
      const matchesAngkatan = filters.angkatan === 'all' || voter.angkatan === filters.angkatan
      const matchesStatus = filters.statusSuara === 'all' || voter.statusSuara === filters.statusSuara
      const matchesAkademik = filters.akademik === 'all' || voter.akademik === filters.akademik
      const matchesTipe = filters.tipe === 'all' || voter.tipe === filters.tipe
      return matchesSearch && matchesFakultas && matchesAngkatan && matchesStatus && matchesAkademik && matchesTipe
    })
  }, [filters, voters])

  const pageCount = useMemo(() => Math.max(1, Math.ceil(total / limit)), [limit, total])
  const startIndex = (page - 1) * limit

  const handleSelectAll = () => {
    if (filteredVoters.every((voter) => selected.has(voter.id))) {
      clearSelection()
    } else {
      selectAll(filteredVoters.map((voter) => voter.id))
    }
  }

  const handleDeleteVoter = async (voterId: string, voterName: string) => {
    if (!token) return
    const confirmed = await showPopup({
      title: 'Konfirmasi Hapus Pemilih',
      message: `Hapus pemilih "${voterName}" dari DPT?\n\nPeringatan: Aksi ini tidak dapat dibatalkan!`,
      type: 'warning',
      confirmText: 'Hapus',
      cancelText: 'Batal'
    })
    if (!confirmed) return

    setDeleting(true)
    try {
      await deleteAdminDptVoter(token, voterId)
      await refresh()
      showToast('Pemilih berhasil dihapus dari DPT', 'success')
    } catch (err) {
      console.error('Failed to delete voter', err)
      showToast('Gagal menghapus pemilih: ' + ((err as any)?.message || 'Unknown error'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkDelete = async () => {
    if (!token || selected.size === 0) return
    const confirmed = await showPopup({
      title: 'Konfirmasi Hapus Massal',
      message: `Hapus ${selected.size} pemilih dari DPT?\n\nPeringatan: Aksi ini tidak dapat dibatalkan!`,
      type: 'warning',
      confirmText: 'Hapus Semua',
      cancelText: 'Batal'
    })
    if (!confirmed) return

    setDeleting(true)
    let successCount = 0
    let errorCount = 0

    for (const voterId of selected) {
      try {
        await deleteAdminDptVoter(token, voterId)
        successCount++
      } catch (err) {
        console.error('Failed to delete voter', voterId, err)
        errorCount++
      }
    }

    clearSelection()
    await refresh()
    showToast(`Selesai: ${successCount} berhasil dihapus, ${errorCount} gagal`, successCount > 0 ? 'success' : 'error')
    setDeleting(false)
  }

  const handleUpdateStatus = async (electionVoterId: string, status: ElectionVoterStatus, voterName: string) => {
    if (!token || !activeElectionId) return
    
    const confirmed = await showPopup({
      title: 'Konfirmasi Update Status',
      message: `Ubah status "${voterName}" menjadi ${electionVoterStatusLabels[status]}?`,
      type: 'info',
      confirmText: 'Ya, Ubah',
      cancelText: 'Batal'
    })
    if (!confirmed) return

    setUpdating(true)
    try {
      await updateElectionVoter(token, parseInt(electionVoterId), { status }, activeElectionId)
      await refresh()
      showToast(`Status berhasil diubah menjadi ${electionVoterStatusLabels[status]}`, 'success')
    } catch (err) {
      console.error('Failed to update status', err)
      showToast('Gagal mengubah status: ' + ((err as any)?.message || 'Unknown error'), 'error')
    } finally {
      setUpdating(false)
    }
  }

  const handleBulkVerify = async () => {
    if (!token || !activeElectionId || selected.size === 0) return
    
    const confirmed = await showPopup({
      title: 'Konfirmasi Verifikasi Massal',
      message: `Verifikasi ${selected.size} pemilih terpilih?`,
      type: 'info',
      confirmText: 'Verifikasi Semua',
      cancelText: 'Batal'
    })
    if (!confirmed) return

    setUpdating(true)
    let successCount = 0
    let errorCount = 0

    for (const electionVoterId of selected) {
      try {
        await updateElectionVoter(token, parseInt(electionVoterId), { status: 'VERIFIED' }, activeElectionId)
        successCount++
      } catch (err) {
        console.error('Failed to verify voter', electionVoterId, err)
        errorCount++
      }
    }

    clearSelection()
    await refresh()
    showToast(`Selesai: ${successCount} berhasil diverifikasi, ${errorCount} gagal`, successCount > 0 ? 'success' : 'error')
    setUpdating(false)
  }

  return (
    <AdminLayout title="Daftar Pemilih">
      <div className="admin-dpt-page">
        <div className="page-header">
          <div>
            <h1>Daftar Pemilih (DPT)</h1>
            <p>Kelola data pemilih sah PEMIRA UNIWA, termasuk status hak suara.</p>
          </div>
          <div className="header-actions">
            <button className="btn-outline" type="button" onClick={() => navigate('/admin/dpt/import')}>
              + Import DPT
            </button>
            <button className="btn-primary" type="button" onClick={() => showToast('Export data (simulasi)', 'info')}>
              Export Data
            </button>
          </div>
        </div>

        <div className="status-row">
          {loading && <span>Memuat data DPT...</span>}
          {deleting && <span>Menghapus data...</span>}
          {updating && <span>Memperbarui status...</span>}
          {error && <span className="error-text">{error}</span>}
          <button className="btn-outline" type="button" onClick={() => void refresh()} disabled={loading || deleting || updating}>
            Muat ulang
          </button>
        </div>

        <div className="filters">
          <input
            type="search"
            placeholder="Cari NIM/NIDN/NIP / Nama / Email"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
          <select value={filters.fakultas} onChange={(event) => setFilters((prev) => ({ ...prev, fakultas: event.target.value }))}>
            {fakultasOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'Semua Fakultas' : option}
              </option>
            ))}
          </select>
          <select value={filters.angkatan} onChange={(event) => setFilters((prev) => ({ ...prev, angkatan: event.target.value }))}>
            {angkatanOptions.map((option) => (
              <option key={option} value={option}>
                {option === 'all' ? 'Semua Angkatan' : option}
              </option>
            ))}
          </select>
          <select value={filters.statusSuara} onChange={(event) => setFilters((prev) => ({ ...prev, statusSuara: event.target.value as VoterStatus | 'all' }))}>
            <option value="all">Status Suara: Semua</option>
            <option value="belum">Belum Memilih</option>
            <option value="sudah">Sudah Memilih</option>
          </select>
          <select value={filters.akademik} onChange={(event) => setFilters((prev) => ({ ...prev, akademik: event.target.value as AcademicStatus | 'all' }))}>
            <option value="all">Status Akademik: Semua</option>
            <option value="aktif">Aktif</option>
            <option value="cuti">Cuti</option>
            <option value="nonaktif">Nonaktif</option>
          </select>
          <select value={filters.tipe} onChange={(event) => setFilters((prev) => ({ ...prev, tipe: event.target.value as typeof filters.tipe }))}>
            <option value="all">Tipe Pemilih: Semua</option>
            <option value="mahasiswa">Mahasiswa</option>
            <option value="dosen">Dosen</option>
            <option value="staf">Staf</option>
          </select>
          <select value={filters.electionVoterStatus} onChange={(event) => setFilters((prev) => ({ ...prev, electionVoterStatus: event.target.value as typeof filters.electionVoterStatus }))}>
            <option value="all">Status Verifikasi: Semua</option>
            <option value="PENDING">Menunggu Verifikasi</option>
            <option value="VERIFIED">Terverifikasi</option>
            <option value="REJECTED">Ditolak</option>
            <option value="VOTED">Sudah Memilih</option>
            <option value="BLOCKED">Diblokir</option>
          </select>
        </div>

        <div className="mass-actions">
          <label>
            <input type="checkbox" checked={filteredVoters.every((voter) => selected.has(voter.id)) && filteredVoters.length > 0} onChange={handleSelectAll} disabled={deleting || updating} />
            Pilih semua di halaman
          </label>
          <select onChange={(e) => {
            if (e.target.value === 'delete') {
              void handleBulkDelete()
              e.target.value = ''
            } else if (e.target.value === 'verify') {
              void handleBulkVerify()
              e.target.value = ''
            }
          }} disabled={selected.size === 0 || deleting || updating}>
            <option value="">Aksi Massal ({selected.size} dipilih)</option>
            <option value="verify">✓ Verifikasi Pemilih</option>
            <option value="delete">Hapus dari DPT</option>
          </select>
        </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th />
                <th>No</th>
                <th>NIM/NIDN/NIP</th>
                <th>Nama</th>
                <th>Fakultas</th>
                <th>Prodi</th>
                <th>Semester</th>
                <th>Tipe Pemilih</th>
                <th>Akademik</th>
                <th>Status Verifikasi</th>
                <th>Status Suara</th>
                <th>Metode</th>
                <th>Aksi</th>
                <th>Terakhir Vote</th>
              </tr>
            </thead>
            <tbody>
              {filteredVoters.length === 0 && (
                <tr>
                  <td colSpan={13} className="empty-state">
                    Tidak ada data pemilih.
                  </td>
                </tr>
              )}
              {filteredVoters.map((voter, idx) => (
                <tr key={voter.id}>
                  <td>
                    <input type="checkbox" checked={selected.has(voter.id)} onChange={() => toggleSelect(voter.id)} />
                  </td>
                  <td>{startIndex + idx + 1}</td>
                  <td>{voter.nim}</td>
                  <td>{voter.nama}</td>
                  <td>{voter.fakultas}</td>
                  <td>{voter.prodi}</td>
                  <td>{voter.semester ?? '-'}</td>
                  <td>
                    {voter.tipe ? (
                      voter.tipe
                    ) : (
                      <span style={{ color: '#ff6b6b', fontWeight: 'bold' }} title="Tipe pemilih belum ditentukan">
                        ⚠️ Belum ditentukan
                      </span>
                    )}
                  </td>
                  <td>{akademikLabels[voter.akademik]}</td>
                  <td>
                    {voter.electionVoterStatus ? (
                      <span className={`status-chip status-${voter.electionVoterStatus.toLowerCase()}`}>
                        {electionVoterStatusLabels[voter.electionVoterStatus]}
                      </span>
                    ) : (
                      <span className="status-chip">-</span>
                    )}
                  </td>
                  <td>
                    <span className={`status-chip ${voter.statusSuara}`}>{statusSuaraLabels[voter.statusSuara]}</span>
                  </td>
                  <td>
                    <div className="stacked-cell">
                      <span>{voter.metodeVoting}</span>
                      {voter.waktuVoting && <small>{new Date(voter.waktuVoting).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</small>}
                    </div>
                  </td>
                  <td>
                    {voter.electionVoterStatus === 'PENDING' && (
                      <button 
                        className="btn-table" 
                        type="button" 
                        onClick={() => void handleUpdateStatus(voter.id, 'VERIFIED', voter.nama)} 
                        disabled={deleting || updating}
                        style={{ marginRight: '4px', backgroundColor: '#10b981', color: 'white' }}
                      >
                        ✓ Verifikasi
                      </button>
                    )}
                    {voter.electionVoterStatus === 'VERIFIED' && (
                      <button 
                        className="btn-table" 
                        type="button" 
                        onClick={() => void handleUpdateStatus(voter.id, 'REJECTED', voter.nama)} 
                        disabled={deleting || updating}
                        style={{ marginRight: '4px', backgroundColor: '#ef4444', color: 'white' }}
                      >
                        ✗ Tolak
                      </button>
                    )}
                    <button className="btn-table" type="button" onClick={() => navigate(`/admin/dpt/${voter.id}`)} disabled={deleting || updating}>
                      Detail
                    </button>
                    <button className="btn-table" type="button" onClick={() => navigate(`/admin/dpt/${voter.id}/edit`)} disabled={deleting || updating} style={{ marginLeft: '4px' }}>
                      Edit
                    </button>
                    <button className="btn-table danger" type="button" onClick={() => void handleDeleteVoter(voter.id, voter.nama)} disabled={deleting || updating} style={{ marginLeft: '4px' }}>
                      Hapus
                    </button>
                  </td>
                  <td>
                    <div className="stacked-cell">
                      <span>{voter.waktuVoting ? new Date(voter.waktuVoting).toLocaleString('id-ID') : '-'}</span>
                      {voter.metodeVoting && voter.metodeVoting !== '-' && <small>{voter.metodeVoting.toUpperCase()}</small>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination-row">
          <div>
            Menampilkan {filteredVoters.length ? `${startIndex + 1}–${startIndex + filteredVoters.length}` : '0'} dari {total.toLocaleString('id-ID')} pemilih
          </div>
          <div className="pagination-controls">
            <button className="btn-outline" type="button" onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1 || loading}>
              ◀ Sebelumnya
            </button>
            <span>
              Halaman {page} / {pageCount}
            </span>
            <button className="btn-outline" type="button" onClick={() => setPage(Math.min(pageCount, page + 1))} disabled={page >= pageCount || loading}>
              Berikutnya ▶
            </button>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminDPTList
