import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PemiraLogos from '../components/shared/PemiraLogos'
import { useAdminAuth } from '../hooks/useAdminAuth'
import '../styles/AdminLogin.css'

const AdminLogin = (): JSX.Element => {
  const navigate = useNavigate()
  const { login, loading, error } = useAdminAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setLocalError(null)
    try {
      await login(username.trim(), password)
      navigate('/admin')
    } catch (err) {
      const message = (err as { message?: string })?.message ?? 'Login gagal'
      setLocalError(message)
    }
  }

  return (
    <div className="admin-login-page">
      <div className="admin-login-card">
        <div className="admin-login-brand">
          <PemiraLogos size="sm" subtitle="Admin Panel" variant="kpu" />
        </div>
        <h1>Login Admin</h1>
        <p>Masuk untuk mengelola PEMIRA.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" required />
          </label>
          <label>
            Password
            <div className="password-field">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
              <button type="button" className="btn-ghost" onClick={() => setShowPassword((prev) => !prev)}>
                {showPassword ? 'Hide' : 'Show'}
              </button>
            </div>
          </label>
          {(localError || error) && <div className="error-box">{localError ?? error}</div>}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>
        <a className="back-link" href="/">
          ← Kembali ke halaman utama
        </a>
      </div>
    </div>
  )
}

export default AdminLogin
