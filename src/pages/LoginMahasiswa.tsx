import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useVotingSession } from '../hooks/useVotingSession'
import { loginUser } from '../services/auth'
import '../styles/LoginMahasiswa.css'

type LoginFormData = {
  username: string
  password: string
}

const LoginMahasiswa = (): JSX.Element => {
  const navigate = useNavigate()
  const { setSession } = useVotingSession()

  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    setError(null)
  }

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    setLoading(true)
    setError(null)
    loginUser(formData.username.trim(), formData.password)
      .then((response) => {
        setSession({
          accessToken: response.access_token,
          refreshToken: response.refresh_token,
          user: {
            id: response.user.id,
            username: response.user.username,
            role: response.user.role,
            voterId: response.user.voter_id,
            profile: response.user.profile,
          },
          votingStatus: 'not_started',
          hasVoted: false,
        })
        navigate('/dashboard')
      })
      .catch((err: any) => {
        setError(err?.message ?? 'Login gagal. Periksa username/password.')
      })
      .finally(() => setLoading(false))
  }

  return (
    <div className="login-page">
      <header className="login-header">
        <div className="login-header-container">
          <div>
            <p className="badge">PEMIRA UNIWA</p>
            <h1>Masuk ke Akun</h1>
            <p>Akses voting online dan informasi kandidat.</p>
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
              <h2>Info penting</h2>
              <ul>
                <li>Gunakan kredensial yang diberikan KPUM.</li>
                <li>Jika belum punya akun, daftar melalui halaman pendaftaran.</li>
                <li>Jaga kerahasiaan username dan password Anda.</li>
              </ul>
            </div>
          </div>

          <div className="login-right">
            <div className="login-card">
              <p className="label">Login</p>
              <h3>Masuk untuk mulai memilih</h3>
              <form onSubmit={handleSubmit} className="login-form">
                <label>
                  Username
                  <input name="username" value={formData.username} onChange={handleInputChange} autoComplete="username" required />
                </label>
                <label>
                  Password
                  <div className="password-field">
                    <input
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={handleInputChange}
                      autoComplete="current-password"
                      required
                    />
                    <button type="button" className="btn-ghost" onClick={() => setShowPassword((prev) => !prev)}>
                      {showPassword ? 'Hide' : 'Show'}
                    </button>
                  </div>
                </label>

                {error && <div className="error-box">{error}</div>}

                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Memproses...' : 'Masuk'}
                </button>
                <p className="helper">
                  Belum punya akun? <a href="/register">Daftar sekarang</a>
                </p>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginMahasiswa
