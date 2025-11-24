import { useState } from 'react'
import PemiraLogos from './PemiraLogos'
import { usePopup } from '../Popup'
import type { VoterProfile } from '../../types/voting'
import '../../styles/shared/PageHeader.css'

type PageHeaderProps = {
  logo?: boolean
  title?: string
  user?: VoterProfile
  showUserMenu?: boolean
  onLogout?: () => void
}

const PageHeader = ({
  logo = true,
  title,
  user,
  showUserMenu = true,
  onLogout,
}: PageHeaderProps): JSX.Element => {
  const [showDropdown, setShowDropdown] = useState(false)
  const { showPopup } = usePopup()

  const handleLogout = async () => {
    setShowDropdown(false)
    if (onLogout) {
      onLogout()
      return
    }
    const confirmed = await showPopup({
      title: 'Konfirmasi Keluar',
      message: 'Yakin ingin keluar?',
      type: 'warning',
      confirmText: 'Keluar',
      cancelText: 'Batal',
    })
    if (confirmed) {
      window.sessionStorage.clear()
      window.location.href = '/'
    }
  }

  return (
    <header className="page-header-nav">
      <div className="page-header-container">
        <div className="header-left">
          {logo && (
            <>
              <div className="header-logo">
                <PemiraLogos size="sm" />
              </div>
              {title && <span className="header-divider">|</span>}
            </>
          )}
          {title && <span className="header-title">{title}</span>}
        </div>

        {showUserMenu && user && (
          <div className="header-right">
            <div className="user-menu">
              <button className="user-menu-trigger" onClick={() => setShowDropdown((prev) => !prev)}>
                <span className="user-avatar">{user.nama.charAt(0)}</span>
                <span className="user-name">{user.nama}</span>
                <span className="dropdown-icon">▼</span>
              </button>

              {showDropdown && (
                <div className="user-dropdown">
                  <div className="dropdown-header">
                    <div className="user-info">
                      <strong>{user.nama}</strong>
                      <span>{user.nim}</span>
                      {user.fakultas && <span>{user.fakultas}</span>}
                      {user.prodi && <span>{user.prodi}</span>}
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <a href="/dashboard" className="dropdown-item">
                    Dashboard
                  </a>
                  <a href="#profil" className="dropdown-item">
                    Profil
                  </a>
                  <a href="#aktivitas" className="dropdown-item">
                    Log Aktivitas
                  </a>
                  <div className="dropdown-divider" />
                  <button onClick={handleLogout} className="dropdown-item logout">
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

export default PageHeader
