import { useEffect, useMemo, useState } from 'react'
import { BrowserQRCodeSvgWriter } from '@zxing/library'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import { useTPSAdminStore } from '../hooks/useTPSAdminStore'
import { useToast } from '../components/Toast'
import { usePopup } from '../components/Popup'
import type { TPSAdmin } from '../types/tpsAdmin'
import '../styles/AdminTPS.css'

const AdminTPSDetail = (): JSX.Element => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getById, loadDetail, rotateQr, deleteTPS, saveTPS, loading } = useTPSAdminStore()
  const [tps, setTps] = useState<TPSAdmin | undefined>(() => (id ? getById(id) : undefined))
  const [qrImage, setQrImage] = useState<string | undefined>(undefined)
  const [formState, setFormState] = useState<TPSAdmin | undefined>(undefined)
  const [techConfig, setTechConfig] = useState({ offlineOnly: true, requireCheckin: true, qrIntegrated: true })
  const [adminNote, setAdminNote] = useState('')
  const { showToast } = useToast()
  const { showPopup } = usePopup()

  useEffect(() => {
    if (id && /^\d+$/.test(id)) {
      void (async () => {
        const detail = await loadDetail(id)
        if (detail) setTps(detail)
      })()
    } else {
      setTps(undefined)
    }
  }, [id, loadDetail])

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

  const handleSaveTechConfig = async () => {
    await handleSaveInfo()
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
                Jam Mulai Voting
                <input type="time" value={formState?.jamBuka ?? ''} onChange={(event) => handleFormChange('jamBuka', event.target.value)} />
              </label>
              <label>
                Jam Selesai Voting
                <input type="time" value={formState?.jamTutup ?? ''} onChange={(event) => handleFormChange('jamTutup', event.target.value)} />
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
                <p className="eyebrow">Konfigurasi Teknis</p>
                <h2>Aturan Operasional TPS</h2>
              </div>
            </div>
            <div className="info-grid">
              <label>
                Kapasitas Pemilih (rekomendasi)
                <input
                  type="number"
                  value={formState?.kapasitas ?? 0}
                  onChange={(event) => handleFormChange('kapasitas', Number(event.target.value))}
                  min={0}
                />
              </label>
              <div className="toggle-stack full-row">
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={techConfig.offlineOnly}
                    onChange={(event) => setTechConfig((prev) => ({ ...prev, offlineOnly: event.target.checked }))}
                  />
                  Hanya pemilih mode OFFLINE (TPS)
                </label>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={techConfig.requireCheckin}
                    onChange={(event) => setTechConfig((prev) => ({ ...prev, requireCheckin: event.target.checked }))}
                  />
                  Wajib check-in sebelum voting
                </label>
                <label className="check-row">
                  <input
                    type="checkbox"
                    checked={techConfig.qrIntegrated}
                    onChange={(event) => setTechConfig((prev) => ({ ...prev, qrIntegrated: event.target.checked }))}
                  />
                  Terhubung dengan sistem QR pendaftaran
                </label>
              </div>
              <label className="full-row">
                Catatan Admin (opsional)
                <textarea value={adminNote} onChange={(event) => setAdminNote(event.target.value)} />
              </label>
            </div>
            <div className="form-actions">
              <button className="btn-primary" type="button" onClick={handleSaveTechConfig}>
                Simpan Konfigurasi
              </button>
            </div>
          </section>

          <section className="card detail-section">
            <div className="section-head">
              <div>
                <p className="eyebrow">Operator TPS</p>
                <h2>Tim Operator</h2>
              </div>
              <button
                className="btn-primary"
                type="button"
                onClick={() => showToast('Tambah operator TPS belum terhubung ke backend.', 'info')}
              >
                + Tambah Operator
              </button>
            </div>
            <div className="table-wrapper card">
              <table>
                <thead>
                  <tr>
                    <th>Nama</th>
                    <th>Username</th>
                    <th>Role</th>
                    <th>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {(tps.operators ?? []).length === 0 && (
                    <tr>
                      <td colSpan={4} className="empty-state">
                        Belum ada operator TPS.
                      </td>
                    </tr>
                  )}
                  {(tps.operators ?? []).map((op) => (
                    <tr key={op.userId}>
                      <td>{op.name ?? '-'}</td>
                      <td>{op.username}</td>
                      <td>TPS_OPERATOR</td>
                      <td>
                        <button
                          className="btn-outline danger"
                          type="button"
                          onClick={() => showToast('Hapus operator belum tersedia.', 'warning')}
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
                <h3>934</h3>
              </div>
              <div>
                <p className="muted">Alokasi ke {tps.nama}</p>
                <h3>{(formState?.kapasitas ?? tps.kapasitas)?.toLocaleString('id-ID') || '0'} pemilih</h3>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ width: '48%' }} />
              </div>
              <p className="muted">250 total / 120 sudah memilih / 130 belum memilih</p>
              <button className="btn-outline" type="button" onClick={() => showToast('Daftar pemilih TPS belum tersedia.', 'info')}>
                Lihat Daftar Pemilih TPS
              </button>
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
                <h3>140</h3>
              </div>
              <div>
                <p className="muted">Sudah memilih</p>
                <h3>120</h3>
              </div>
              <div>
                <p className="muted">Belum memilih</p>
                <h3>110</h3>
              </div>
            </div>
            <div className="mini-chart">
              <p className="muted">Timeline ringkas</p>
              <div className="mini-chart-row">
                <span>08:00</span>
                <div className="mini-chart-bar" style={{ width: '40%' }} />
                <span className="muted">10 CI / 5 V</span>
              </div>
              <div className="mini-chart-row">
                <span>09:00</span>
                <div className="mini-chart-bar" style={{ width: '70%' }} />
                <span className="muted">40 CI / 25 V</span>
              </div>
              <div className="mini-chart-row">
                <span>10:00</span>
                <div className="mini-chart-bar" style={{ width: '95%' }} />
                <span className="muted">80 CI / 60 V</span>
              </div>
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
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminTPSDetail
