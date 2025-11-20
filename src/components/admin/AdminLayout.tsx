import type { ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAdminAuth } from '../../hooks/useAdminAuth'
import '../../styles/AdminDashboard.css'

export const adminMenuItems = [
  { label: 'Dashboard Utama', href: '/admin', exact: true },
  { label: 'Manajemen Kandidat', href: '/admin/kandidat' },
  { label: 'Daftar Pemilih (DPT)', href: '/admin/dpt' },
  { label: 'TPS Management', href: '/admin/tps' },
  { label: 'Status Voting & Monitoring', href: '/admin/monitoring' },
  { label: 'Pengaturan Pemilu', href: '/admin/pengaturan' },
]

type AdminLayoutProps = {
  children: ReactNode
  title?: string
}

const AdminLayout = ({ children, title = 'Admin Panel' }: AdminLayoutProps): JSX.Element => {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAdminAuth()
  const isActive = (href: string, exact?: boolean) => {
    if (exact) return location.pathname === href
    return location.pathname === href || location.pathname.startsWith(`${href}/`)
  }

  return (
    <div className="admin-dashboard">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">PEMIRA UNIWA</div>
        <nav>
          <ul>
            {adminMenuItems.map((item) => (
              <li key={item.href}>
                <Link to={item.href} className={isActive(item.href, item.exact) ? 'active' : ''}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      <div className="admin-main">
        <header className="admin-header">
          <div>
            <p className="header-label">PEMIRA UNIWA</p>
            <h1>{title}</h1>
          </div>
          <div className="admin-user">
            <button type="button">
              {user ? `Admin: ${user.username}` : 'Admin'} <span>▼</span>
            </button>
            <div className="user-dropdown">
              <button type="button" onClick={() => navigate('/admin')}>Dashboard</button>
              <button type="button" onClick={() => navigate('/admin/pengaturan')}>Pengaturan</button>
              <button type="button" onClick={() => logout()}>Logout</button>
            </div>
          </div>
        </header>

        <main className="admin-content">{children}</main>
      </div>
    </div>
  )
}

export default AdminLayout
