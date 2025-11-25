import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BrowserQRCodeReader } from '@zxing/library'
import AdminLayout from '../components/admin/AdminLayout'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useTPSPanelStore } from '../hooks/useTPSPanelStore'
import { createTpsCheckin, type CreateCheckinPayload } from '../services/tpsPanel'
import { useToast } from '../components/Toast'
import '../styles/AdminTPSPanel.css'

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

const formatTime = (value?: string) => (value ? timeFormatter.format(new Date(value)) : '—')

const AdminTPSPanel = (): JSX.Element => {
  const navigate = useNavigate()
  const { user, token } = useAdminAuth()
  const [searchParams] = useSearchParams()
  const tpsIdParam = searchParams.get('tpsId') ?? undefined
  const { panelInfo, queue, syncFromApi, triggerManualRefresh, addQueueEntry } = useTPSPanelStore()
  const { showToast } = useToast()

  const [manualCode, setManualCode] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'CHECKED_IN' | 'VOTED'>('all')
  const [search, setSearch] = useState('')
  const [lastSuccess, setLastSuccess] = useState<{ nama: string; nim: string; status: string } | null>(null)
  const [detailEntry, setDetailEntry] = useState<typeof queue[number] | null>(null)
  const [checkinLoading, setCheckinLoading] = useState(false)
  const [checkinError, setCheckinError] = useState<string | null>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [scanError, setScanError] = useState<string | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const readerRef = useRef<BrowserQRCodeReader | null>(null)

  useEffect(() => {
    if (token && tpsIdParam) {
      void syncFromApi(token, tpsIdParam)
    }
  }, [syncFromApi, token, tpsIdParam])

  const handleCheckin = async (payload: CreateCheckinPayload) => {
    if (!token || !tpsIdParam) {
      setCheckinError('Token admin atau TPS tidak ditemukan.')
      return
    }
    try {
      setCheckinLoading(true)
      setCheckinError(null)
      const entry = await createTpsCheckin(token, tpsIdParam, payload)
      addQueueEntry({
        nim: entry.nim,
        nama: entry.nama,
        fakultas: entry.fakultas,
        prodi: entry.prodi,
        angkatan: entry.angkatan,
        statusMahasiswa: entry.statusMahasiswa,
        mode: entry.mode,
      })
      setLastSuccess({ nama: entry.nama, nim: entry.nim, status: entry.status })
      showToast('Check-in berhasil', 'success')
    } catch (err: any) {
      const msg = (err?.message as string) ?? 'Gagal check-in'
      const lower = msg.toUpperCase()
      const mapped =
        lower.includes('INVALID_REGISTRATION_QR') ? 'QR tidak valid untuk TPS ini.' :
        lower.includes('NOT_TPS_VOTER') ? 'Pemilih tidak dialokasikan ke TPS ini.' :
        lower.includes('ALREADY_VOTED') ? 'Pemilih sudah memberikan suara.' :
        lower.includes('CHECKIN_EXISTS') ? 'Pemilih sudah check-in.' :
        lower.includes('TPS_MISMATCH') ? 'QR tidak sesuai TPS.' :
        msg
      setCheckinError(mapped)
      showToast(mapped, 'error')
    } finally {
      setCheckinLoading(false)
    }
  }

  const stopCamera = useCallback(() => {
    setIsScanning(false)
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
    readerRef.current?.reset()
  }, [])

  useEffect(() => () => stopCamera(), [stopCamera])

  const startScan = async () => {
    if (!videoRef.current) return
    setIsScanning(true)
    setScanError(null)
    const reader = new BrowserQRCodeReader()
    readerRef.current = reader
    try {
      const result = await reader.decodeOnceFromVideoDevice(undefined, videoRef.current)
      const qrPayload = result?.getText()
      if (!qrPayload) {
        setScanError('QR payload tidak terbaca. Coba ulangi scan.')
      } else {
        await handleCheckin({ qr_payload: qrPayload })
      }
    } catch (err) {
      console.error('QR scan error', err)
      setScanError('Gagal mengakses kamera atau membaca QR.')
    } finally {
      stopCamera()
    }
  }

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) return
    await handleCheckin({ registration_code: manualCode.trim() })
    setManualCode('')
  }

  const handleRefresh = () => {
    if (token && tpsIdParam) {
      void syncFromApi(token, tpsIdParam)
    } else {
      triggerManualRefresh()
    }
  }

  const filteredQueue = useMemo(() => {
    return queue.filter((entry) => {
      const matchStatus = statusFilter === 'all' || entry.status === statusFilter
      const query = search.toLowerCase()
      const matchSearch = entry.nama.toLowerCase().includes(query) || entry.nim.toLowerCase().includes(query)
      return matchStatus && matchSearch
    })
  }, [queue, search, statusFilter])

  return (
    <AdminLayout title={`TPS Panel - ${panelInfo.tpsName}`}>
      <div className="admin-tps-panel">
        <div className="panel-breadcrumb">Pemilu &gt; PEMIRA UNIWA 2025 &gt; {panelInfo.tpsCode || 'TPS'}</div>
        <header className="panel-header card">
          <div>
            <p className="eyebrow">TPS Panel</p>
            <h1>{panelInfo.tpsName}</h1>
            <p className="muted">Lokasi: {panelInfo.lokasi} · Jam: {panelInfo.jamOperasional}</p>
            <div className="badge-row">
              <span className="status-chip active">TPS {panelInfo.status || 'OPEN'}</span>
              <span className="status-chip active">Pemilu: VOTING_OPEN</span>
              {user && (
                <span className="status-chip neutral">
                  Login sebagai: {user.role ?? 'Admin'}
                </span>
              )}
            </div>
          </div>
          <div className="header-actions">
            <button className="btn-outline" type="button" onClick={() => navigate(`/admin/tps/${tpsIdParam ?? ''}`)}>
              Lihat detail TPS
            </button>
          </div>
        </header>

        <div className="summary-grid">
          <section className="card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Info TPS</p>
                <h3>{panelInfo.tpsCode} – {panelInfo.tpsName}</h3>
              </div>
            </div>
            <p className="muted">Lokasi: {panelInfo.lokasi}</p>
            <p className="muted">Jam: {panelInfo.jamOperasional}</p>
          </section>
          <section className="card">
            <div className="section-head">
              <div>
                <p className="eyebrow">Ringkasan</p>
                <h3>Statistik TPS</h3>
              </div>
            </div>
            <div className="stats-row">
              <div>
                <p className="muted">Total Pemilih TPS</p>
                <strong>{panelInfo.totalVoters}</strong>
              </div>
              <div>
                <p className="muted">Check-in</p>
                <strong>{queue.length}</strong>
              </div>
              <div>
                <p className="muted">Sudah Memilih</p>
                <strong>{queue.filter((item) => item.status === 'VOTED').length}</strong>
              </div>
            </div>
          </section>
        </div>

        <section className="card scan-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Scan QR Pendaftaran</p>
              <h2>Check-in Pemilih</h2>
            </div>
            <button className="btn-primary" type="button" onClick={startScan} disabled={checkinLoading || isScanning}>
              {isScanning ? 'Memindai...' : checkinLoading ? 'Memproses...' : 'Mulai Scan Kamera'}
            </button>
          </div>
          <div className="scan-instructions">
            <p>Instruksi:</p>
            <ul>
              <li>Minta pemilih menunjukkan QR pendaftaran.</li>
              <li>Arahkan kamera perangkat ke QR di area scan.</li>
            </ul>
          </div>
          <div className="scan-frame">
            <div className="scan-area">
              <video ref={videoRef} autoPlay muted playsInline className="scan-video" />
              {isScanning && <div className="scan-line" />}
              {!isScanning && !scanError && <div className="scan-placeholder">Klik "Mulai Scan Kamera" untuk memindai.</div>}
              {scanError && <div className="scan-error">{scanError}</div>}
            </div>
          </div>
          <div className="manual-entry">
            <p>Jika kamera bermasalah:</p>
            <div className="manual-row">
              <input type="text" placeholder="Masukkan kode pendaftaran manual" value={manualCode} onChange={(event) => setManualCode(event.target.value)} />
              <button className="btn-outline" type="button" onClick={handleManualSubmit} disabled={!manualCode.trim() || checkinLoading}>
                {checkinLoading ? 'Memproses...' : 'Submit'}
              </button>
            </div>
            {checkinError && <p className="error-text">{checkinError}</p>}
          </div>
          {lastSuccess && (
            <div className="success-box">
              <strong>✔ Pemilih berhasil check-in</strong>
              <p>Nama: {lastSuccess.nama}</p>
              <p>NIM: {lastSuccess.nim}</p>
              <p>Status: {lastSuccess.status}</p>
              <p>Berikan surat suara fisik kepada pemilih.</p>
            </div>
          )}
        </section>

        <section className="card attendance-card">
          <div className="section-head">
            <div>
              <p className="eyebrow">Daftar Kehadiran</p>
              <h2>Pemilih TPS</h2>
            </div>
            <div className="filters">
              <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}>
                <option value="all">Status: Semua</option>
                <option value="CHECKED_IN">CHECKED_IN</option>
                <option value="VOTED">VOTED</option>
              </select>
              <input type="search" placeholder="Cari nama / NIM" value={search} onChange={(event) => setSearch(event.target.value)} />
              <button className="btn-outline" type="button" onClick={handleRefresh}>
                Refresh
              </button>
            </div>
          </div>

          <div className="table-wrapper card">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama Pemilih</th>
                  <th>NIM</th>
                  <th>Prodi</th>
                  <th>Status</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {filteredQueue.length === 0 && (
                  <tr>
                    <td colSpan={6} className="empty-state">
                      Belum ada pemilih yang check-in.
                    </td>
                  </tr>
                )}
                {filteredQueue.map((entry, index) => (
                  <tr key={entry.id} onClick={() => setDetailEntry(entry)}>
                    <td>{index + 1}</td>
                    <td>{entry.nama}</td>
                    <td>{entry.nim}</td>
                    <td>{entry.prodi}</td>
                    <td>
                      <span className={`status-chip ${entry.status === 'VOTED' ? 'active' : 'neutral'}`}>
                        {entry.status}
                      </span>
                    </td>
                    <td>{formatTime(entry.waktuCheckIn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="card mini-stats">
          <div className="section-head">
            <div>
              <p className="eyebrow">Aktivitas TPS</p>
              <h3>Ringkasan Cepat</h3>
            </div>
            <button className="btn-link" type="button" onClick={() => navigate('/admin/monitoring')}>
              Lihat Detail Statistik TPS Ini
            </button>
          </div>
          <div className="mini-chart">
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
        </section>

        {detailEntry && (
          <div className="modal-backdrop" role="presentation" onClick={() => setDetailEntry(null)}>
            <div className="modal" role="dialog" onClick={(event) => event.stopPropagation()}>
              <h3>Detail Kehadiran Pemilih</h3>
              <p>Nama: {detailEntry.nama}</p>
              <p>NIM: {detailEntry.nim}</p>
              <p>Prodi: {detailEntry.prodi}</p>
              <p>Status: {detailEntry.status}</p>
              <p>Check-in: {formatTime(detailEntry.waktuCheckIn)}</p>
              <p>Voted: {detailEntry.voteTime ? formatTime(detailEntry.voteTime) : '—'}</p>
              <button className="btn-primary" type="button" onClick={() => setDetailEntry(null)}>
                Tutup
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminTPSPanel
