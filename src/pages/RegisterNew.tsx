import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PemiraLogos from '../components/shared/PemiraLogos'
import {
  registerStudent,
  registerLecturer,
  registerStaff,
  loginUser,
  type StudentRegistrationResponse,
  type LecturerRegistrationResponse,
  type StaffRegistrationResponse,
} from '../services/auth'
import { useVotingSession } from '../hooks/useVotingSession'
import type { ApiError } from '../utils/apiClient'
import '../styles/LoginMahasiswa.css'

type VoterType = 'student' | 'lecturer' | 'staff'
type Step = 'form' | 'success'

type RegistrationData = 
  | StudentRegistrationResponse 
  | LecturerRegistrationResponse 
  | StaffRegistrationResponse

const RegisterNew = (): JSX.Element => {
  const navigate = useNavigate()
  const { setSession } = useVotingSession()

  const [step, setStep] = useState<Step>('form')
  const [voterType, setVoterType] = useState<VoterType>('student')
  const [agree, setAgree] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    identifier: '', // nim, nidn, or nip
    name: '',
    password: '',
    confirmPassword: '',
    email: '',
    phone: '',
  })

  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const heroRef = useRef<HTMLDivElement | null>(null)
  const formCardRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const hero = heroRef.current
    const card = formCardRef.current
    const reveal = (el: HTMLElement | null, delay = 0) => {
      if (!el) return
      el.style.transitionDelay = `${delay}ms`
      el.classList.add('reveal-in')
    }
    reveal(hero, 50)
    if (card) {
      card.style.transitionDelay = '150ms'
      card.classList.add('reveal-card')
    }
  }, [])

  // Reset form when voter type changes
  useEffect(() => {
    setFormData({
      identifier: '',
      name: '',
      password: '',
      confirmPassword: '',
      email: '',
      phone: '',
    })
    setError(null)
  }, [voterType])

  const getIdentifierLabel = () => {
    switch (voterType) {
      case 'student': return 'NIM'
      case 'lecturer': return 'NIDN'
      case 'staff': return 'NIP'
    }
  }

  const getIdentifierPlaceholder = () => {
    switch (voterType) {
      case 'student': return 'Contoh: 2021001'
      case 'lecturer': return 'Contoh: 0123456789'
      case 'staff': return 'Contoh: 198501012010121001'
    }
  }

  const canSubmit = 
    agree && 
    !loading && 
    formData.identifier.trim() !== '' &&
    formData.name.trim() !== '' &&
    formData.password.length >= 8 &&
    formData.password === formData.confirmPassword

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)

    try {
      let result: RegistrationData

      const basePayload = {
        name: formData.name.trim(),
        password: formData.password,
        email: formData.email.trim() || undefined,
        phone: formData.phone.trim() || undefined,
      }

      if (voterType === 'student') {
        result = await registerStudent({
          nim: formData.identifier.trim(),
          ...basePayload
        })
      } else if (voterType === 'lecturer') {
        result = await registerLecturer({
          nidn: formData.identifier.trim(),
          ...basePayload
        })
      } else {
        result = await registerStaff({
          nip: formData.identifier.trim(),
          ...basePayload
        })
      }

      setRegistrationData(result)
      
      // Auto login after successful registration
      try {
        const loginResult = await loginUser(formData.identifier.trim(), formData.password)
        setSession({
          accessToken: loginResult.access_token,
          refreshToken: loginResult.refresh_token,
          user: {
            id: loginResult.user.id,
            username: loginResult.user.username,
            role: loginResult.user.role,
            voterId: loginResult.user.voter_id,
            profile: loginResult.user.profile,
          },
          hasVoted: false,
          votingStatus: 'not_started',
        })
      } catch (loginErr) {
        console.warn('Auto-login failed after registration:', loginErr)
      }

      setStep('success')
    } catch (err: any) {
      const apiErr = err as ApiError
      
      if (apiErr?.status === 409) {
        setError(`${getIdentifierLabel()} sudah terdaftar sebagai voter.`)
      } else {
        setError(apiErr?.message || 'Registrasi gagal. Coba lagi.')
      }
    } finally {
      setLoading(false)
    }
  }

  const renderSuccess = () => (
    <div className="login-card" style={{ textAlign: 'center' }}>
      <div className="big-check">✔</div>
      <h2>Registrasi Berhasil!</h2>
      
      {registrationData && (
        <div className="success-box">
          <p className="credential"><strong>Nama:</strong> {registrationData.name}</p>
          <p className="credential">
            <strong>{getIdentifierLabel()}:</strong> {
              'nim' in registrationData ? registrationData.nim :
              'nidn' in registrationData ? registrationData.nidn :
              'nip' in registrationData ? registrationData.nip : ''
            }
          </p>
          {registrationData.email && (
            <p className="credential"><strong>Email:</strong> {registrationData.email}</p>
          )}
          {registrationData.phone && (
            <p className="credential"><strong>Telepon:</strong> {registrationData.phone}</p>
          )}
        </div>
      )}

      <p style={{ marginTop: '20px' }}>{registrationData?.message}</p>

      <button 
        className="btn-primary btn-block" 
        onClick={() => navigate('/login')} 
        type="button"
        style={{ marginTop: '20px' }}
      >
        Ke Halaman Login
      </button>
    </div>
  )

  if (step === 'success') {
    return (
      <div className="login-page premium-page">
        <div className="login-main success-state">
          {renderSuccess()}
        </div>
      </div>
    )
  }

  return (
    <div className="login-page premium-page">
      <header className="login-topbar new-appbar" ref={heroRef}>
        <div className="topbar-inner">
          <div className="topbar-left">
            <PemiraLogos size="lg" title="PEMIRA UNIWA 2025" className="auth-logo-large" />
          </div>
        </div>
      </header>

      <main className="login-main">
        <div className="auth-shell fade-in-up">
          <div className="auth-heading">
            <p className="eyebrow">REGISTRASI</p>
            <h1>Daftar Pemilih</h1>
            <p className="heading-sub">
              Gunakan {getIdentifierLabel()} Anda yang sudah terdaftar di sistem kampus.
            </p>
          </div>

          <details className="info-accordion">
            <summary>
              <span>ℹ️ Informasi Penting</span>
              <span className="accordion-icon">+</span>
            </summary>
            <div className="accordion-body">
              <ul>
                <li>Isi data sesuai dengan identitas kampus Anda</li>
                <li>Pastikan {getIdentifierLabel()} yang dimasukkan benar</li>
                <li>Email dan telepon bersifat opsional</li>
                <li>Password minimal 8 karakter</li>
                <li>Simpan password Anda dengan aman</li>
              </ul>
            </div>
          </details>

          <div className="role-selector">
            <span className="role-label">Daftar sebagai</span>
            <div className="tab-row compact">
              <button
                type="button"
                className={voterType === 'student' ? 'active' : ''}
                onClick={() => setVoterType('student')}
              >
                Mahasiswa
              </button>
              <button
                type="button"
                className={voterType === 'lecturer' ? 'active' : ''}
                onClick={() => setVoterType('lecturer')}
              >
                Dosen
              </button>
              <button
                type="button"
                className={voterType === 'staff' ? 'active' : ''}
                onClick={() => setVoterType('staff')}
              >
                Staf
              </button>
            </div>
          </div>

          <div className="login-card premium-card" ref={formCardRef}>
            <form onSubmit={handleSubmit} className="login-form">
              {/* Step 1: Data Pribadi */}
              <div className="section-block">
                <div className="section-header">
                  <p className="eyebrow">1. Data Pribadi</p>
                  <h3>Informasi Identitas</h3>
                </div>

                <label className="form-field">
                  <span className="field-label">{getIdentifierLabel()}</span>
                  <input
                    type="text"
                    value={formData.identifier}
                    onChange={(e) => setFormData(prev => ({ ...prev, identifier: e.target.value }))}
                    placeholder={getIdentifierPlaceholder()}
                    required
                  />
                </label>

                <label className="form-field">
                  <span className="field-label">Nama Lengkap</span>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Masukkan nama lengkap Anda"
                    required
                  />
                </label>
              </div>

              {/* Step 2: Password */}
              <div className="section-block">
                <div className="section-header">
                  <p className="eyebrow">2. Buat Password</p>
                  <h3>Atur Password Login</h3>
                </div>

                <label className="form-field">
                  <span className="field-label">Password</span>
                  <div style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="Minimal 8 karakter"
                      minLength={8}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '18px'
                      }}
                    >
                      {showPassword ? '👁️' : '👁️‍🗨️'}
                    </button>
                  </div>
                </label>

                <label className="form-field">
                  <span className="field-label">Konfirmasi Password</span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Ketik ulang password"
                    required
                  />
                  {formData.confirmPassword && formData.password !== formData.confirmPassword && (
                    <span className="field-hint" style={{ color: '#ef4444' }}>
                      Password tidak cocok
                    </span>
                  )}
                </label>
              </div>

              <div className="section-block">
                <div className="section-header">
                  <p className="eyebrow">3. Kontak (Opsional)</p>
                  <h3>Informasi Kontak</h3>
                </div>

                <label className="form-field">
                  <span className="field-label">Email (opsional)</span>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="email@example.com"
                  />
                </label>

                <label className="form-field">
                  <span className="field-label">Telepon (opsional)</span>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="08123456789"
                    pattern="^(08\d{8,11}|\+628\d{8,12})$"
                  />
                  <span className="field-hint">Format: 08xxx atau +62xxx</span>
                </label>
              </div>

              <div className="section-block">
                <label className="checkbox-field">
                  <input
                    type="checkbox"
                    checked={agree}
                    onChange={(e) => setAgree(e.target.checked)}
                  />
                  <span>
                    Saya setuju bahwa data yang saya berikan adalah benar dan saya bertanggung jawab penuh.
                  </span>
                </label>
              </div>

              {error && (
                <div className="alert-error" style={{ marginBottom: '16px' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="btn-primary btn-block"
                disabled={!canSubmit}
              >
                {loading ? 'Mendaftar...' : 'Daftar Sekarang'}
              </button>
            </form>

            <div className="login-footer">
              <p>
                Sudah punya akun?{' '}
                <a href="/login" onClick={(e) => { e.preventDefault(); navigate('/login') }}>
                  Login di sini
                </a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default RegisterNew
