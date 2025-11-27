import { useEffect, useMemo, useState } from 'react'
import { BrowserQRCodeSvgWriter } from '@zxing/library'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import { useTPSAdminStore } from '../hooks/useTPSAdminStore'
import { useToast } from '../components/Toast'
import { usePopup } from '../components/Popup'
import type { TPSActivitySummary, TPSAdmin, TPSAllocationSummary, TPSOperator } from '../types/tpsAdmin'
import '../styles/AdminTPS.css'

const AdminTPSDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getById, loadDetail, rotateQr, deleteTPS, saveTPS, loading, fetchOperators, addOperator, removeOperator, fetchAllocation, fetchActivity } = useTPSAdminStore()
  const [tps, setTps] = useState<TPSAdmin | undefined>(() => (id ? getById(id) : undefined))
  const [qrImage, setQrImage] = useState<string | undefined>(undefined)
  const [formState, setFormState] = useState<TPSAdmin | undefined>(undefined)
  const [adminNote, setAdminNote] = useState('')
  const [operators, setOperators] = useState<TPSOperator[]>([])
  const [opForm, setOpForm] = useState({ username: '', password: '', name: '', email: '' })
  const [opLoading, setOpLoading] = useState(false)
  const [allocation, setAllocation] = useState<TPSAllocationSummary | null>(null)
  const [activity, setActivity] = useState<TPSActivitySummary | null>(null)
  const { showToast } = useToast()
  const { showPopup } = usePopup()

  useEffect(() => {
    if (id && /^\d+$/.test(id)) {
      void (async () => {
        const detail = await loadDetail(id)
        if (detail) setTps(detail)
        try {
          const [ops, alloc, act] = await Promise.all([
            fetchOperators(id).catch(() => []),
            fetchAllocation(id).catch(() => null),
            fetchActivity(id).catch(() => null),
          ])
          setOperators(ops)
          setAllocation(alloc)
          setActivity(act)
        } catch (err) {
          console.warn('Failed to fetch TPS extra data', err)
        }
      })()
    } else {
      setTps(undefined)
    }
  }, [id, loadDetail, fetchActivity, fetchAllocation, fetchOperators])

  useEffect(() => {
    if (tps) {
      setFormState(tps)
      setAdminNote(tps.catatan ?? '')
    }
  }, [tps])

  useEffect(() => {
    if (!tps?.qrPayload) {
      setQrImage(undefined)
      return
    }
    try {
      const writer = new BrowserQRCodeSvgWriter()
      const svg = writer.write(tps.qrPayload, 240, 240)
      const serializer = new XMLSerializer()
      const svgString = serializer.serializeToString(svg)
      setQrImage(`data:image/svg+xml;base64,${btoa(svgString)}`)
    } catch (err) {
      console.warn('Failed to render TPS QR', err)
      setQrImage(undefined)
    }
  }, [tps?.qrPayload])

  const statusLabel = useMemo(() => (tps?.status === 'active' ? 'Aktif' : 'Tidak aktif'), [tps?.status])

  const handleFormChange = <K extends keyof TPSAdmin>(field: K, value: TPSAdmin[K]) => {
    setFormState((prev) => (prev ? { ...prev, [field]: value } : prev))
  }

  const handleSaveInfo = async () => {
    if (!formState) return
    try {
      const saved = await saveTPS({ ...formState, catatan: adminNote })
      setTps(saved)
      showToast('Informasi TPS disimpan.', 'success')
    } catch (err) {
      console.error('Failed to save TPS info', err)
      showToast('Gagal menyimpan informasi TPS.', 'error')
    }
  }

  const handleAddOperator = async () => {
    if (!tps || !opForm.username || !opForm.password) {
      showToast('Lengkapi username dan password operator', 'error')
      return
    }
    try {
      setOpLoading(true)
      const created = await addOperator(tps.id, opForm)
      setOperators((prev) => [...prev, created])
      setOpForm({ username: '', password: '', name: '', email: '' })
      showToast('Operator TPS ditambahkan', 'success')
    } catch (err) {
      console.error('Failed to add operator', err)
      showToast((err as any)?.message || 'Gagal menambah operator', 'error')
    } finally {
      setOpLoading(false)
    }
  }

  const handleRemoveOperator = async (userId: number) => {
    if (!tps) return
    const confirmed = await showPopup({
      title: 'Hapus Operator',
      message: 'Hapus operator TPS ini? Aksesnya akan dicabut.',
      type: 'warning',
      confirmText: 'Hapus',
      cancelText: 'Batal',
    })
    if (!confirmed) return
    try {
      await removeOperator(tps.id, userId)
      setOperators((prev) => prev.filter((op) => op.userId !== userId))
      showToast('Operator dihapus', 'success')
    } catch (err) {
      console.error('Failed to remove operator', err)
      showToast((err as any)?.message || 'Gagal menghapus operator', 'error')
    }
  }

  const handleRotateQr = async () => {
    if (!id) return
    const updated = await rotateQr(id)
    if (updated) setTps(updated)
  }

  const handlePrintQr = () => {
    if (!tps || !qrImage) return
    const printWindow = window.open('', '_blank', 'width=800,height=600')
    if (!printWindow) return
    const html = `
      <html>
        <head>
          <title>QR TPS ${tps.nama} (${tps.kode})</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 24px; }
            .meta { margin-top: 12px; font-size: 14px; color: #334155; }
            img { width: 260px; height: 260px; }
          </style>
        </head>
        <body>
          <h2>QR TPS ${tps.nama} (${tps.kode})</h2>
          <div><img src="${qrImage}" alt="QR TPS" /></div>
          <div class="meta">
            <div>Payload: ${tps.qrPayload ?? '-'}</div>
            <div>Dicetak: ${new Date().toLocaleString('id-ID')}</div>
          </div>
          <script>window.onload = () => { window.focus(); window.print(); }</script>
        </body>
      </html>
    `
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  if (!tps) {
    return (
      <AdminLayout title="Detail TPS">
        <div className="admin-tps-page">
          <div className="empty-state card">
            <p>TPS tidak ditemukan.</p>
            <button className="btn-primary" type="button" onClick={() => navigate('/admin/tps')}>
              Kembali ke Manajemen TPS
            </button>
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout title="Detail TPS">
      <div className="admin-tps-page">
        <p className="breadcrumb">PEMIRA UNIWA 2025 &gt; TPS &gt; {tps.nama}</p>

        <section className="card page-hero">
          <div className="page-header">
            <button className="btn-link" type="button" onClick={() => navigate('/admin/tps')}>
              ← Kembali ke daftar TPS
            </button>
            <h1>Detail TPS – {tps.nama}</h1>
            <p className="muted">
              Kode: {tps.kode} · Status: <span className={`status-chip ${tps.status}`}>{statusLabel}</span> · QR: {tps.qrAktif ? 'Aktif' : 'Belum ada'}
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-outline" type="button" onClick={() => navigate(`/admin/tps/${tps.id}/edit`)}>
              Edit TPS
            </button>
            <button className="btn-primary" type="button" onClick={() => navigate(`/admin/tps/panel?tpsId=${tps.id}`)}>
              Buka Panel TPS
            </button>
            <button
              className="btn-outline danger"
              type="button"
              onClick={async () => {
                const confirmed = await showPopup({
                  title: 'Konfirmasi Hapus TPS',
                  message: 'Hapus TPS ini? Tindakan ini tidak bisa dibatalkan.',
                  type: 'warning',
                  confirmText: 'Hapus',
                  cancelText: 'Batal'
                })
                if (!confirmed) return
                try {
                  await deleteTPS(tps.id)
                  navigate('/admin/tps')
                } catch (err) {
                  console.error('Failed to delete TPS', err)
                  showToast('Gagal menghapus TPS dari server.', 'error')
                }
              }}
            >
              Hapus TPS
            </button>
          </div>
        </section>

        {loading && <p className="muted">Memuat data TPS dari server...</p>}

        <div className="detail-grid">
          <section className="card detail-section">
            <div className="section-head">
              <div>
                <p className="eyebrow">Info & Status</p>
                <h2>Profil TPS</h2>
              </div>
              <span className={`status-chip ${formState?.status ?? tps.status}`}>{statusLabel}</span>
            </div>
            <div className="info-grid">
              <label>
                Kode TPS
                <input type="text" value={formState?.kode ?? ''} onChange={(event) => handleFormChange('kode', event.target.value)} />
              </label>
              <label>
                Nama TPS
                <input type="text" value={formState?.nama ?? ''} onChange={(event) => handleFormChange('nama', event.target.value)} />
              </label>
              <label className="full-row">
                Lokasi
                <input type="text" value={formState?.lokasi ?? ''} onChange={(event) => handleFormChange('lokasi', event.target.value)} />
              </label>
              <label>
                Status TPS
                <select value={formState?.status ?? 'active'} onChange={(event) => handleFormChange('status', event.target.value as TPSAdmin['status'])}>
                  <option value="active">Aktif</option>
                  <option value="inactive">Nonaktif</option>
                </select>
              </label>
              <label>
                Kapasitas Pemilih
                <input
                  type="number"
                  min={0}
                  value={formState?.kapasitas ?? 0}
                  onChange={(event) => handleFormChange('kapasitas', Number(event.target.value))}
                />
              </label>
              <label>
                Jam Mulai Voting
                <input type="time" value={formState?.jamBuka ?? ''} onChange={(event) => handleFormChange('jamBuka', event.target.value)} />
              </label>
              <label>
                Jam Selesai Voting
                <input type="time" value={formState?.jamTutup ?? ''} onChange={(event) => handleFormChange('jamTutup', event.target.value)} />
              </label>
              <label className="full-row">
                Catatan Admin (opsional)
                <textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} />
              </label>
            </div>
            <div className="form-actions">
              <button className="btn-primary" type="button" onClick={handleSaveInfo}>
                Simpan Perubahan
              </button>
            </div>
          </section>

        <section className="card detail-section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Alokasi Pemilih</p>
              <h2>Distribusi TPS</h2>
            </div>
          </div>
          <div className="allocation-grid">
            <div>
              <p className="muted">Total pemilih mode TPS di pemilu ini</p>
              <h3>{allocation?.totalTpsVoters?.toLocaleString('id-ID') ?? '0'}</h3>
            </div>
            <div>
              <p className="muted">Alokasi ke {tps.nama}</p>
              <h3>{allocation?.allocatedToThisTps?.toLocaleString('id-ID') ?? '0'} pemilih</h3>
            </div>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: allocation ? `${Math.min(100, (allocation.allocatedToThisTps || 0) / Math.max(1, allocation.totalTpsVoters || 1) * 100)}%` : '0%' }}
              />
            </div>
            <p className="muted">
              {(allocation?.allocatedToThisTps ?? 0).toLocaleString('id-ID')} total / {(allocation?.voted ?? 0).toLocaleString('id-ID')} sudah memilih / {(allocation?.notVoted ?? 0).toLocaleString('id-ID')} belum memilih
            </p>
            {allocation?.voters && allocation.voters.length > 0 && (
              <div className="mini-table">
                <div className="mini-table-head">
                  <span>Nama</span>
                  <span>Status</span>
                </div>
                {allocation.voters.slice(0, 5).map((voter) => (
                  <div key={voter.voterId} className="mini-table-row">
                    <span>{voter.name} ({voter.nim})</span>
                    <span className={`status-chip ${voter.hasVoted ? 'active' : 'neutral'}`}>{voter.hasVoted ? 'Sudah memilih' : 'Belum'}</span>
                  </div>
                ))}
                {allocation.voters.length > 5 && <p className="muted">+{allocation.voters.length - 5} lagi</p>}
              </div>
            )}
          </div>
        </section>

        <section className="card detail-section">
          <div className="section-head">
            <div>
              <p className="eyebrow">Aktivitas TPS</p>
              <h2>Monitoring Ringkas</h2>
            </div>
          </div>
          <div className="activity-grid">
            <div>
              <p className="muted">Check-in hari ini</p>
              <h3>{activity?.checkinsToday ?? 0}</h3>
            </div>
            <div>
              <p className="muted">Sudah memilih</p>
              <h3>{activity?.voted ?? 0}</h3>
            </div>
            <div>
              <p className="muted">Belum memilih</p>
              <h3>{activity?.notVoted ?? 0}</h3>
            </div>
          </div>
          <div className="mini-chart">
            <p className="muted">Timeline ringkas</p>
            {activity?.timeline?.length ? (
              activity.timeline.map((row) => {
                const checkedWidth = Math.min(100, (row.checkins || 0) / Math.max(1, activity.checkinsToday || row.checkins || 1) * 100)
                const votedWidth = Math.min(checkedWidth, (row.voted || 0) / Math.max(1, row.checkins || 1) * 100)
                const hour = new Date(row.hour).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
                return (
                  <div key={row.hour} className="mini-chart-row">
                    <span>{hour}</span>
                    <div className="mini-chart-bar">
                      <div className="mini-chart-fill checked" style={{ width: `${checkedWidth}%` }} />
                      <div className="mini-chart-fill voted" style={{ width: `${votedWidth}%` }} />
                    </div>
                    <span className="muted">{row.checkins} CI / {row.voted} V</span>
                  </div>
                )
              })
            ) : (
              <p className="muted">Belum ada data aktivitas.</p>
            )}
          </div>
          <button className="btn-primary" type="button" onClick={() => navigate(`/admin/tps/panel?tpsId=${tps.id}`)}>
            Buka TPS Panel (mode operator)
          </button>
        </section>

          <section className="card detail-section danger-zone">
            <div className="section-head">
              <div>
                <p className="eyebrow">Aksi Lanjutan</p>
                <h2>Danger Zone</h2>
              </div>
            </div>
            <div className="danger-actions">
              <button
                className="btn-outline danger"
                type="button"
                onClick={async () => {
                  const confirmed = await showPopup({
                    title: 'Nonaktifkan TPS',
                    message: 'TPS nonaktif tidak akan muncul di panel operator.',
                    type: 'warning',
                    confirmText: 'Nonaktifkan',
                    cancelText: 'Batal',
                  })
                  if (!confirmed || !formState) return
                  const next = { ...formState, status: 'inactive' as TPSAdmin['status'] }
                  setFormState(next)
                  await saveTPS({ ...next, catatan: adminNote })
                  showToast('TPS dinonaktifkan.', 'success')
                }}
              >
                Nonaktifkan TPS Ini
              </button>
              <button className="btn-outline" type="button" onClick={() => showToast('Export daftar hadir belum tersedia.', 'info')}>
                Export Daftar Hadir TPS (CSV/PDF)
              </button>
              <button className="btn-outline" type="button" onClick={() => showToast('Export log belum tersedia.', 'info')}>
                Export Log Aktivitas TPS
              </button>
            </div>
          </section>

          <section className="card detail-section">
            <div className="section-head">
              <div>
                <p className="eyebrow">QR TPS</p>
                <h2>Token & Cetak QR</h2>
              </div>
            </div>
            <p>Token QR: {tps.qrToken ?? 'Belum tersedia'}</p>
            <p>Payload cetak: {tps.qrPayload ?? 'Belum tersedia'}</p>
            {tps.qrCreatedAt && <p>Dibuat: {new Date(tps.qrCreatedAt).toLocaleString('id-ID')}</p>}
            <div className="qr-preview">
              {qrImage ? <img src={qrImage} alt="QR TPS" /> : <div className="qr-placeholder">QR belum tersedia. Generate dulu.</div>}
            </div>
            <div className="qr-actions">
              <button className="btn-outline" type="button" onClick={() => void handleRotateQr()}>
                {tps.qrAktif ? 'Rotate QR' : 'Generate QR'}
              </button>
              <button className="btn-link" type="button" onClick={() => void loadDetail(tps.id)}>
                Segarkan data QR
              </button>
              <button className="btn-primary" type="button" onClick={handlePrintQr} disabled={!qrImage}>
                Download/Print QR (PDF)
              </button>
            </div>
            <p className="muted">Endpoint backend: GET /admin/tps/{tps.id}/qr dan POST /admin/tps/{tps.id}/qr/rotate.</p>
          </section>

          <section className="card detail-section">
            <div className="section-head">
              <div>
                <p className="eyebrow">Operator TPS</p>
                <h2>Tim Operator</h2>
              </div>
            </div>
            <div className="table-wrapper card">
              <table>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Username</th>
                    <th>Email</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {operators.length === 0 && (
                    <tr>
                      <td colSpan={4} className="empty-state">
                        Belum ada operator TPS.
                      </td>
                    </tr>
                  )}
                  {operators.map((op) => (
                    <tr key={op.userId}>
                      <td>{op.name ?? '-'}</td>
                      <td>{op.username}</td>
                      <td>{op.email ?? '-'}</td>
                      <td>
                        <button className="btn-outline danger" type="button" onClick={() => void handleRemoveOperator(op.userId)}>
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="operator-form">
              <div className="form-grid" style={{ display: 'grid', gap: '0.75rem', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
                <label>
                  Username
                  <input value={opForm.username} onChange={(e) => setOpForm((prev) => ({ ...prev, username: e.target.value }))} />
                </label>
                <label>
                  Password
                  <input type="password" value={opForm.password} onChange={(e) => setOpForm((prev) => ({ ...prev, password: e.target.value }))} />
                </label>
                <label>
                  Nama
                  <input value={opForm.name} onChange={(e) => setOpForm((prev) => ({ ...prev, name: e.target.value }))} />
                </label>
                <label>
                  Email
                  <input value={opForm.email} onChange={(e) => setOpForm((prev) => ({ ...prev, email: e.target.value }))} />
                </label>
              </div>
              <div className="form-actions">
                <button className="btn-primary" type="button" onClick={() => void handleAddOperator()} disabled={opLoading}>
                  {opLoading ? 'Menyimpan...' : 'Tambah Operator'}
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminTPSDetail
