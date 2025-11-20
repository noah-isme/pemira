import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVotingSession } from '../hooks/useVotingSession'
import { registerLecturerOrStaff, registerStudent } from '../services/auth'
import '../styles/LoginMahasiswa.css'

type RoleTab = 'student' | 'lecturer' | 'staff'

const Register = (): JSX.Element => {
  const navigate = useNavigate()
  const { setSession } = useVotingSession()
  const [activeTab, setActiveTab] = useState<RoleTab>('student')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const [studentForm, setStudentForm] = useState({ nim: '', name: '', email: '', password: '' })
  const [staffForm, setStaffForm] = useState({ username: '', name: '', email: '', password: '' })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    try {
      if (activeTab === 'student') {
        const res = await registerStudent(studentForm)
        setSession({
          accessToken: res.access_token,
          refreshToken: res.refresh_token,
          user: { id: res.user.id, username: res.user.username, role: res.user.role, voterId: res.user.voter_id, profile: res.user.profile },
          hasVoted: false,
          votingStatus: 'not_started',
        })
      } else {
        const type = activeTab === 'lecturer' ? 'LECTURER' : 'STAFF'
        const res = await registerLecturerOrStaff({ ...staffForm, type })
        setSession({
          accessToken: res.access_token,
          refreshToken: res.refresh_token,
          user: { id: res.user.id, username: res.user.username, role: res.user.role, voterId: res.user.voter_id, profile: res.user.profile },
          hasVoted: false,
          votingStatus: 'not_started',
        })
      }
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.message ?? 'Pendaftaran gagal. Coba lagi.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="login-header-container">
          <div>
            <p className="badge">PEMIRA UNIWA</p>
            <h1>Daftar Akun</h1>
            <p>Buat akun baru untuk mengikuti PEMIRA.</p>
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
              <h2>Langkah Pendaftaran</h2>
              <ul>
                <li>Pilih peran: Mahasiswa, Dosen, atau Staf.</li>
                <li>Isi data sesuai format kampus.</li>
                <li>Simpan username/password Anda dengan aman.</li>
              </ul>
            </div>
          </div>

          <div className="login-right">
            <div className="login-card">
              <div className="tab-row">
                <button type="button" className={activeTab === 'student' ? 'active' : ''} onClick={() => setActiveTab('student')}>
                  Mahasiswa
                </button>
                <button type="button" className={activeTab === 'lecturer' ? 'active' : ''} onClick={() => setActiveTab('lecturer')}>
                  Dosen
                </button>
                <button type="button" className={activeTab === 'staff' ? 'active' : ''} onClick={() => setActiveTab('staff')}>
                  Staf
                </button>
              </div>

              <form onSubmit={handleSubmit} className="login-form">
                {activeTab === 'student' ? (
                  <>
                    <label>
                      NIM
                      <input value={studentForm.nim} onChange={(e) => setStudentForm((prev) => ({ ...prev, nim: e.target.value }))} required />
                    </label>
                    <label>
                      Nama Lengkap
                      <input value={studentForm.name} onChange={(e) => setStudentForm((prev) => ({ ...prev, name: e.target.value }))} required />
                    </label>
                    <label>
                      Email Kampus
                      <input type="email" value={studentForm.email} onChange={(e) => setStudentForm((prev) => ({ ...prev, email: e.target.value }))} required />
                    </label>
                    <label>
                      Password
                      <div className="password-field">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={studentForm.password}
                          onChange={(e) => setStudentForm((prev) => ({ ...prev, password: e.target.value }))}
                          required
                        />
                        <button type="button" className="btn-ghost" onClick={() => setShowPassword((prev) => !prev)}>
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </label>
                  </>
                ) : (
                  <>
                    <label>
                      Username
                      <input value={staffForm.username} onChange={(e) => setStaffForm((prev) => ({ ...prev, username: e.target.value }))} required />
                    </label>
                    <label>
                      Nama Lengkap
                      <input value={staffForm.name} onChange={(e) => setStaffForm((prev) => ({ ...prev, name: e.target.value }))} required />
                    </label>
                    <label>
                      Email
                      <input type="email" value={staffForm.email} onChange={(e) => setStaffForm((prev) => ({ ...prev, email: e.target.value }))} required />
                    </label>
                    <label>
                      Password
                      <div className="password-field">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          value={staffForm.password}
                          onChange={(e) => setStaffForm((prev) => ({ ...prev, password: e.target.value }))}
                          required
                        />
                        <button type="button" className="btn-ghost" onClick={() => setShowPassword((prev) => !prev)}>
                          {showPassword ? 'Hide' : 'Show'}
                        </button>
                      </div>
                    </label>
                  </>
                )}

                {error && <div className="error-box">{error}</div>}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Memproses...' : 'Daftar'}
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
