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
  const { getById, loadDetail, rotateQr, deleteTPS, loading } = useTPSAdminStore()
  const [tps, setTps] = useState<TPSAdmin | undefined>(() => (id ? getById(id) : undefined))
  const [qrImage, setQrImage] = useState<string | undefined>(undefined)
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
        <div className="page-header">
          <div>
            <h1>{tps.nama}</h1>
            <p>
              Kode: {tps.kode} · Status: <span className={`status-chip ${tps.status}`}>{statusLabel}</span> · QR:{' '}
              {tps.qrAktif ? 'Aktif' : 'Belum ada'}
            </p>
          </div>
          <div className="header-actions">
            <button className="btn-link" type="button" onClick={() => navigate('/admin/tps')}>
              ← Kembali ke daftar
            </button>
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
        </div>

        {loading && <p>Memuat data TPS dari server...</p>}

        <section className="card detail-section">
          <h2>Informasi Utama</h2>
          <ul>
            <li>
              <strong>Lokasi:</strong> {tps.lokasi || '-'}
            </li>
            <li>
              <strong>Jam Operasional:</strong> {tps.jamBuka || '—'} – {tps.jamTutup || '—'}
            </li>
            <li>
              <strong>Perkiraan Kapasitas:</strong> {tps.kapasitas?.toLocaleString('id-ID') ?? '-'}
            </li>
            <li>
              <strong>Dibuat:</strong> {tps.createdAt ? new Date(tps.createdAt).toLocaleString('id-ID') : '-'}
            </li>
            <li>
              <strong>Terakhir diperbarui:</strong> {tps.updatedAt ? new Date(tps.updatedAt).toLocaleString('id-ID') : '-'}
            </li>
          </ul>
        </section>

        <section className="card detail-section">
          <h2>PIC & Catatan</h2>
          <ul>
            <li>
              <strong>PIC:</strong> {tps.picNama || '-'}
            </li>
            <li>
              <strong>Kontak PIC:</strong> {tps.picKontak || '-'}
            </li>
            <li>
              <strong>Catatan:</strong> {tps.catatan || '—'}
            </li>
          </ul>
        </section>

        <section className="card detail-section">
          <h2>QR TPS</h2>
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
    </AdminLayout>
  )
}

export default AdminTPSDetail
