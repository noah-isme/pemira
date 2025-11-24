import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AdminLayout from '../components/admin/AdminLayout'
import { useTPSAdminStore } from '../hooks/useTPSAdminStore'
import type { TPSAdmin } from '../types/tpsAdmin'
import '../styles/AdminTPS.css'

const AdminTPSForm = (): JSX.Element => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getById, createEmpty, saveTPS, isKodeAvailable, loadDetail } = useTPSAdminStore()
  const editing = Boolean(id)
  const existing = id ? getById(id) : undefined

  const [formData, setFormData] = useState<TPSAdmin>(existing ?? createEmpty())
  const [submitting, setSubmitting] = useState(false)
  const kodeAvailable = useMemo(() => isKodeAvailable(formData.kode, editing ? formData.id : undefined), [formData.kode, editing, formData.id, isKodeAvailable])
  const pageTitle = editing ? 'Edit TPS' : 'Tambah TPS'

  useEffect(() => {
    if (existing) {
      setFormData(existing)
    }
    if (id) {
      void (async () => {
        const detail = await loadDetail(id)
        if (detail) setFormData(detail)
      })()
    }
  }, [existing, id, loadDetail])

  const updateField = <K extends keyof TPSAdmin>(field: K, value: TPSAdmin[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    if (!formData.nama || !formData.kode || !formData.lokasi) {
      alert('Nama TPS, Kode, dan lokasi wajib diisi.')
      return
    }
    if (!kodeAvailable) {
      alert('Kode TPS sudah digunakan.')
      return
    }
    if (formData.jamBuka && formData.jamTutup && formData.jamBuka >= formData.jamTutup) {
      alert('Jam buka harus lebih awal dibanding jam tutup.')
      return
    }
    try {
      setSubmitting(true)
      const saved = await saveTPS(formData)
      navigate(`/admin/tps/${saved.id}`)
    } catch (err) {
      console.error('Failed to save TPS', err)
      alert('Gagal menyimpan TPS. Coba lagi atau periksa koneksi ke server API.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AdminLayout title={pageTitle}>
      <div className="admin-tps-page">
        <div className="page-header">
          <div>
            <h1>{editing ? `Edit TPS – ${formData.nama}` : 'Tambah TPS Baru'}</h1>
            <p>Atur informasi dan akses TPS agar sinkron dengan backend.</p>
          </div>
          <button className="btn-link" type="button" onClick={() => navigate('/admin/tps')}>
            ← Kembali ke daftar
          </button>
        </div>

        <form className="tps-form" onSubmit={(event) => event.preventDefault()}>
          <section>
            <h2>Informasi Dasar</h2>
            <div className="form-grid">
              <label>
                Nama TPS
                <input type="text" value={formData.nama} onChange={(event) => updateField('nama', event.target.value)} required />
              </label>
              <label>
                Kode TPS
                <input type="text" value={formData.kode} onChange={(event) => updateField('kode', event.target.value.toUpperCase())} required />
                {!kodeAvailable && <small className="error">Kode sudah digunakan.</small>}
              </label>
            </div>
            <label>
              Lokasi Detail
              <input type="text" value={formData.lokasi} onChange={(event) => updateField('lokasi', event.target.value)} />
            </label>
          </section>

          <section>
            <h2>Jam Operasional</h2>
            <div className="form-grid">
              <label>
                Jam Buka
                <input type="time" value={formData.jamBuka} onChange={(event) => updateField('jamBuka', event.target.value)} />
              </label>
              <label>
                Jam Tutup
                <input type="time" value={formData.jamTutup} onChange={(event) => updateField('jamTutup', event.target.value)} />
              </label>
            </div>
          </section>

          <section>
            <h2>Kapasitas & Catatan</h2>
            <label>
              Perkiraan Kapasitas
              <input type="number" value={formData.kapasitas} onChange={(event) => updateField('kapasitas', Number(event.target.value))} />
            </label>
            <label>
              Nama PIC / Penanggung Jawab
              <input type="text" value={formData.picNama ?? ''} onChange={(event) => updateField('picNama', event.target.value)} placeholder="Opsional" />
            </label>
            <label>
              Kontak PIC (Telepon/WA)
              <input type="text" value={formData.picKontak ?? ''} onChange={(event) => updateField('picKontak', event.target.value)} placeholder="Opsional" />
            </label>
            <label>
              Catatan Internal
              <textarea value={formData.catatan ?? ''} onChange={(event) => updateField('catatan', event.target.value)} placeholder="Contoh: Dekat lobi, butuh colokan tambahan" />
            </label>
          </section>

          <section>
            <h2>Status TPS</h2>
            <div className="status-options">
              <label>
                <input type="radio" checked={formData.status === 'active'} onChange={() => updateField('status', 'active')} />
                Aktif
              </label>
              <label>
                <input type="radio" checked={formData.status === 'inactive'} onChange={() => updateField('status', 'inactive')} />
                Tidak aktif
              </label>
            </div>
            <p className="muted">QR statis bisa dibuat atau diputar ulang dari halaman detail setelah TPS disimpan.</p>
          </section>

          <div className="form-actions">
            <button className="btn-primary" type="button" onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Menyimpan...' : 'Simpan TPS'}
            </button>
            <button className="btn-link" type="button" onClick={() => navigate('/admin/tps')}>
              Batal
            </button>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

export default AdminTPSForm
