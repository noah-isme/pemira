import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import { useTPSAdminStore } from '../hooks/useTPSAdminStore'
import type { TPSStatus } from '../types/tpsAdmin'
import '../styles/AdminTPS.css'

const AdminTPSList = (): JSX.Element => {
  const navigate = useNavigate()
  const { tpsList, refresh, loading, error } = useTPSAdminStore()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TPSStatus | 'all'>('all')

  const filteredList = useMemo(() => {
    return tpsList.filter((tps) => {
      const matchesSearch = [tps.nama, tps.kode, tps.lokasi].some((field) => field.toLowerCase().includes(search.toLowerCase()))
      const matchesStatus = statusFilter === 'all' || tps.status === statusFilter
      return matchesSearch && matchesStatus
    })
  }, [search, statusFilter, tpsList])

  return (
    <AdminLayout title="TPS Management">
      <div className="admin-tps-page">
        <div className="page-header">
          <div>
            <h1>Manajemen TPS</h1>
            <p>Kelola seluruh Tempat Pemungutan Suara (TPS) untuk PEMIRA UNIWA.</p>
          </div>
          <button className="btn-primary" type="button" onClick={() => navigate('/admin/tps/tambah')}>
            + Tambah TPS
          </button>
        </div>

      <div className="filters">
        <div className="status-row">
          {loading && <span>Memuat data TPS...</span>}
          {error && <span className="error-text">{error}</span>}
          <button className="btn-outline" type="button" onClick={() => void refresh()}>
            Muat ulang
          </button>
        </div>
        <input type="search" placeholder="Cari nama TPS / lokasi / kode" value={search} onChange={(event) => setSearch(event.target.value)} />
        <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as TPSStatus | 'all')}>
          <option value="all">Semua Status</option>
          <option value="active">Aktif</option>
          <option value="inactive">Tidak aktif</option>
        </select>
      </div>

        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nama TPS</th>
                <th>Kode</th>
                <th>Lokasi</th>
                <th>Jam</th>
                <th>Kapasitas</th>
                <th>PIC</th>
                <th>QR</th>
                <th>Status</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    Belum ada TPS yang cocok.
                  </td>
                </tr>
              )}
              {filteredList.map((tps) => (
                <tr key={tps.id}>
                  <td>
                    <strong>{tps.nama}</strong>
                  </td>
                  <td>{tps.kode}</td>
                  <td>{tps.lokasi}</td>
                  <td>
                    {tps.jamBuka || '—'} – {tps.jamTutup || '—'}
                  </td>
                  <td>{tps.kapasitas?.toLocaleString('id-ID') ?? '-'}</td>
                  <td>{tps.picNama || '-'}</td>
                  <td>{tps.qrAktif ? 'Aktif' : 'Belum ada'}</td>
                  <td>
                    <span className={`status-chip ${tps.status}`}>
                      {tps.status === 'active' ? 'Aktif' : 'Tidak aktif'}
                    </span>
                  </td>
                  <td>
                    <div className="table-actions">
                      <button className="btn-table" type="button" onClick={() => navigate(`/admin/tps/${tps.id}`)}>
                        Detail
                      </button>
                      <button className="btn-table" type="button" onClick={() => navigate(`/admin/tps/${tps.id}/edit`)}>
                        Edit
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminTPSList
