import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserQRCodeSvgWriter } from '@zxing/library'
import { registerLecturerOrStaff, registerStudent } from '../services/auth'
import type { ApiError } from '../utils/apiClient'
import '../styles/LoginMahasiswa.css'

type Role = 'student' | 'lecturer' | 'staff'
type Mode = 'online' | 'tps'
type Step = 'form' | 'success-online' | 'success-tps' | 'duplicate'

const generateQrDataUri = (value: string): string => {
  const writer = new BrowserQRCodeSvgWriter()
  const svgElement = writer.write(value, 360, 360)
  const serializer = new XMLSerializer()
  const svgString = serializer.serializeToString(svgElement)
  return `data:image/svg+xml;base64,${btoa(svgString)}`
}

const Register = (): JSX.Element => {
  const navigate = useNavigate()
  const [step, setStep] = useState<Step>('form')
  const [role, setRole] = useState<Role>('student')
  const [mode, setMode] = useState<Mode>('online')
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [studentForm, setStudentForm] = useState({ nim: '', name: '', email: '', password: '', program: '', angkatan: '' })
  const [staffForm, setStaffForm] = useState({ username: '', name: '', email: '', password: '', program: '', angkatan: '' })

  const [qrValue, setQrValue] = useState<string | null>(null)
  const [qrDataUri, setQrDataUri] = useState<string | null>(null)
  const [lastIdentity, setLastIdentity] = useState<{ username: string; mode: Mode }>({ username: '', mode: 'online' })

  useEffect(() => {
    if (!qrValue) return
    try {
      setQrDataUri(generateQrDataUri(qrValue))
    } catch (err) {
      console.warn('Failed to generate QR', err)
      setQrDataUri(null)
    }
  }, [qrValue])

  const canSubmit = agree && !loading

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return
    setLoading(true)
    setError(null)

    try {
      if (role === 'student') {
        await registerStudent({
          nim: studentForm.nim.trim(),
          name: studentForm.name.trim(),
          email: studentForm.email.trim(),
          password: studentForm.password,
        })
        setLastIdentity({ username: studentForm.nim.trim(), mode })
      } else {
        const type = role === 'lecturer' ? 'LECTURER' : 'STAFF'
        await registerLecturerOrStaff({
          username: staffForm.username.trim(),
          name: staffForm.name.trim(),
          email: staffForm.email.trim(),
          password: staffForm.password,
          type,
        })
        setLastIdentity({ username: staffForm.username.trim(), mode })
      }

      if (mode === 'tps') {
        const baseValue = `${role.toUpperCase()}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}-${lastIdentity.username || studentForm.nim || staffForm.username}`
        setQrValue(baseValue)
        setStep('success-tps')
      } else {
        setStep('success-online')
      }
    } catch (err: any) {
      const apiErr = err as ApiError
      if (apiErr?.status === 409) {
        setStep('duplicate')
        return
      }
      setError(apiErr?.message ?? 'Pendaftaran gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  const onlineNote = useMemo(() => {
    if (mode === 'online') return 'Anda hanya dapat memilih secara daring (online).'
    return 'Anda hanya dapat memilih di TPS sesuai jadwal.'
  }, [mode])

  const renderSuccessOnline = () => (
    <div className="login-card" style={{ textAlign: 'center' }}>
      <div className="big-check">✔</div>
      <h2>Pendaftaran Berhasil!</h2>
      <p>Anda terdaftar sebagai PEMILIH ONLINE pada PEMIRA UNIWA.</p>
      <div className="success-box">
        <p>Gunakan akun berikut untuk login pada hari pemilihan:</p>
        <p className="credential">
          Username: <strong>{lastIdentity.username}</strong>
        </p>
        <p className="credential">Password: dikirim via email</p>
      </div>
      <button className="btn-primary btn-block" onClick={() => navigate('/login')} type="button">
        Ke Halaman Login
      </button>
    </div>
  )

  const renderSuccessTPS = () => (
    <div className="login-card" style={{ textAlign: 'center' }}>
      <div className="big-check">✔</div>
      <h2>Pendaftaran Berhasil!</h2>
      <p>Anda terdaftar sebagai PEMILIH OFFLINE (TPS). Tunjukkan QR berikut kepada panitia.</p>

      <div className="qr-box">
        {qrDataUri ? <img src={qrDataUri} alt="QR TPS" /> : <div className="qr-placeholder">QR-ID: {qrValue}</div>}
        <p className="qr-id">QR-ID: {qrValue}</p>
      </div>

      <p className="small-note">QR berlaku sekali untuk TPS dan tidak dapat digunakan online.</p>

      <div className="actions-row">
        <button className="btn-outline" type="button" onClick={() => window.print()}>
          Cetak QR
        </button>
        <button className="btn-primary" type="button" onClick={() => navigate('/')}>
          Kembali ke Beranda
        </button>
      </div>
    </div>
  )

  const renderDuplicate = () => (
    <div className="login-card" style={{ textAlign: 'center' }}>
      <div className="warning-icon">⚠</div>
      <h2>Pendaftaran Gagal</h2>
      <p>NIM/Username Anda sudah terdaftar sebagai pemilih.</p>
      <p className="small-note">Jika terjadi kesalahan, hubungi panitia PEMIRA.</p>
      <button className="btn-primary btn-block" type="button" onClick={() => setStep('form')}>
        Kembali
      </button>
    </div>
  )

  if (step === 'success-online') return <div className="login-page">{renderSuccessOnline()}</div>
  if (step === 'success-tps') return <div className="login-page">{renderSuccessTPS()}</div>
  if (step === 'duplicate') return <div className="login-page">{renderDuplicate()}</div>

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="login-header-container">
          <div>
            <p className="badge">PEMIRA UNIWA</p>
            <h1>Pendaftaran Pemilih</h1>
            <p>Pilih mode pemilihan: Online atau Offline (TPS).</p>
          </div>
          <img src="/assets/login-illustration.svg" alt="Ilustrasi" />
        </div>
      </header>

      <main className="login-main">
        <div className="login-container">
          <div className="login-left">
            <div className="login-illustration">
              <img src="/assets/login-illustration.svg" alt="Pemilu" />
            </div>
            <div className="login-info">
              <h2>Ketentuan</h2>
              <ul>
                <li>Isi data sesuai NIM/akun kampus UNIWA.</li>
                <li>Pilih satu mode pemilihan untuk menghindari kebingungan.</li>
                <li>Password tidak ditampilkan, dikirim via email.</li>
              </ul>
              <p className="info-note">{onlineNote}</p>
            </div>
          </div>

          <div className="login-right">
            <div className="login-card">
              <div className="tab-row">
                <button type="button" className={role === 'student' ? 'active' : ''} onClick={() => setRole('student')}>
                  Mahasiswa
                </button>
                <button type="button" className={role === 'lecturer' ? 'active' : ''} onClick={() => setRole('lecturer')}>
                  Dosen
                </button>
                <button type="button" className={role === 'staff' ? 'active' : ''} onClick={() => setRole('staff')}>
                  Staf
                </button>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                {role === 'student' ? (
                  <>
                    <label>
                      Nama Lengkap
                      <input value={studentForm.name} onChange={(e) => setStudentForm((prev) => ({ ...prev, name: e.target.value }))} required />
                    </label>
                    <label>
                      NIM Mahasiswa
                      <input value={studentForm.nim} onChange={(e) => setStudentForm((prev) => ({ ...prev, nim: e.target.value }))} required />
                    </label>
                    <label>
                      Program Studi
                      <input value={studentForm.program} onChange={(e) => setStudentForm((prev) => ({ ...prev, program: e.target.value }))} />
                    </label>
                    <label>
                      Angkatan
                      <input value={studentForm.angkatan} onChange={(e) => setStudentForm((prev) => ({ ...prev, angkatan: e.target.value }))} />
                    </label>
                    <label>
                      Email UNIWA
                      <input type="email" value={studentForm.email} onChange={(e) => setStudentForm((prev) => ({ ...prev, email: e.target.value }))} required />
                    </label>
                    <label>
                      Password
                      <input type="password" value={studentForm.password} onChange={(e) => setStudentForm((prev) => ({ ...prev, password: e.target.value }))} required />
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      Nama Lengkap
                      <input value={staffForm.name} onChange={(e) => setStaffForm((prev) => ({ ...prev, name: e.target.value }))} required />
                    </label>
                    <label>
                      Username
                      <input value={staffForm.username} onChange={(e) => setStaffForm((prev) => ({ ...prev, username: e.target.value }))} required />
                    </label>
                    <label>
                      Program Studi / Unit
                      <input value={staffForm.program} onChange={(e) => setStaffForm((prev) => ({ ...prev, program: e.target.value }))} />
                    </label>
                    <label>
                      Angkatan / Tahun Masuk
                      <input value={staffForm.angkatan} onChange={(e) => setStaffForm((prev) => ({ ...prev, angkatan: e.target.value }))} />
                    </label>
                    <label>
                      Email UNIWA
                      <input type="email" value={staffForm.email} onChange={(e) => setStaffForm((prev) => ({ ...prev, email: e.target.value }))} required />
                    </label>
                    <label>
                      Password
                      <input type="password" value={staffForm.password} onChange={(e) => setStaffForm((prev) => ({ ...prev, password: e.target.value }))} required />
                    </label>
                  </>
                )}

                <fieldset className="mode-fieldset">
                  <legend>Pilih Mode Pemilihan</legend>
                  <label className="radio-row">
                    <input type="radio" name="mode" value="online" checked={mode === 'online'} onChange={() => setMode('online')} />
                    <div>
                      <div className="radio-title">Pemilihan Online</div>
                      <div className="radio-desc">Akses login ke platform online. Hanya bisa memilih secara daring.</div>
                    </div>
                  </label>
                  <label className="radio-row">
                    <input type="radio" name="mode" value="tps" checked={mode === 'tps'} onChange={() => setMode('tps')} />
                    <div>
                      <div className="radio-title">Pemilihan Offline (TPS)</div>
                      <div className="radio-desc">Dapat QR pendaftaran dan wajib hadir ke TPS.</div>
                    </div>
                  </label>
                </fieldset>

                <label className="checkbox-row">
                  <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} />
                  <span>Saya menyatakan data yang saya isi benar</span>
                </label>

                {error && <div className="error-box">{error}</div>}

                <button type="submit" className="btn-primary" disabled={!canSubmit}>
                  {loading ? 'Memproses...' : 'Daftar Sekarang'}
                </button>
                <p className="helper">
                  Sudah punya akun? <a href="/login">Masuk</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Register
