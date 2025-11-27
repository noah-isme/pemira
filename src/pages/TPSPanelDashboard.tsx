import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TPSPanelHeader from '../components/TPSPanelHeader'
import { useTPSPanelStore } from '../hooks/useTPSPanelStore'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { usePopup } from '../components/Popup'
import { useActiveElection } from '../hooks/useActiveElection'
import type { TPSQueueEntry } from '../types/tpsPanel'
import '../styles/TPSPanel.css'

const timeFormatter = new Intl.DateTimeFormat('id-ID', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false,
})

const formatTime = (value: string) => timeFormatter.format(new Date(value))

const TPSPanelDashboard = (): JSX.Element => {
  const navigate = useNavigate()
  const { token } = useAdminAuth()
  const { activeElectionId } = useActiveElection()
  const [searchParams] = useSearchParams()
  const tpsIdParam = searchParams.get('tpsId') ?? undefined
  const {
    panelInfo,
    panitia,
    queue,
    setPanelStatus,
    syncFromApi,
    triggerManualRefresh,
  } = useTPSPanelStore()
  const { showPopup } = usePopup()
  const [selectedEntry, setSelectedEntry] = useState<TPSQueueEntry | null>(null)

  useEffect(() => {
    if (token && tpsIdParam) {
      void syncFromApi(token, tpsIdParam, activeElectionId)
    }
  }, [activeElectionId, syncFromApi, token, tpsIdParam])

  const handleScanQR = () => {
    navigate('/tps-panel/scan-qr')
  }

  const handleRefresh = () => {
    if (token && tpsIdParam) {
      void syncFromApi(token, tpsIdParam, activeElectionId)
    } else {
      triggerManualRefresh()
    }
  }

  const handleCloseTPS = async () => {
    if (panelInfo.status !== 'Aktif') return
    const confirmed = await showPopup({
      title: 'Tutup TPS',
      message: 'Tutup TPS Aula Utama?',
      type: 'warning',
      confirmText: 'Tutup TPS',
      cancelText: 'Batal',
    })
    if (!confirmed) return
    setPanelStatus('Ditutup')
  }

  const handleDetail = (entry: TPSQueueEntry) => {
    setSelectedEntry(entry)
    navigate(`/tps-panel/detail/${entry.id}`)
  }

  const getStatusLabel = (entry: TPSQueueEntry) => {
    if (entry.status === 'VOTED') return 'VOTED'
    return 'CHECKED_IN'
  }

  return (
    <div className="tps-panel-page">
      <div className="panel-shell">
        {/* Header Section */}
        <div className="tps-panel-header">
          <div className="header-logo">
            <img src="/assets/images/logo-pemira.png" alt="PEMIRA" />
          </div>
          <div className="header-info">
            <h1>TPS Panel - {panelInfo.tpsName}</h1>
            <div className="operator-info">
              <span>Operator: {panitia.nama}</span>
              <span>TPS Status: {panelInfo.status}</span>
            </div>
          </div>
        </div>

        {/* Main Scan Button */}
        <div className="scan-section">
          <button className="btn-primary btn-large" onClick={handleScanQR}>
            SCAN QR PEMILIH
          </button>
        </div>

        {/* Attendance List */}
        <div className="attendance-section">
          <h2>Daftar Kehadiran (Real-time)</h2>
          <div className="attendance-table-wrapper">
            <table className="attendance-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Nama Pemilih</th>
                  <th>Prodi</th>
                  <th>Status</th>
                  <th>Waktu</th>
                </tr>
              </thead>
              <tbody>
                {queue.length === 0 && (
                  <tr>
                    <td colSpan={5}>
                      <div className="empty-attendance">Belum ada pemilih yang check-in.</div>
                    </td>
                  </tr>
                )}
                {queue.map((entry, index) => (
                  <tr
                    key={entry.id}
                    className={entry.status === 'VOTED' ? 'voted' : 'checked-in'}
                    onClick={() => handleDetail(entry)}
                  >
                    <td>{index + 1}</td>
                    <td>{entry.nama}</td>
                    <td>{entry.prodi}</td>
                    <td>
                      <span className={`status-badge ${entry.status.toLowerCase()}`}>
                        {getStatusLabel(entry)}
                      </span>
                    </td>
                    <td>{formatTime(entry.waktuCheckIn)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="action-buttons">
          <button className="btn-outline" onClick={handleRefresh}>
            Refresh
          </button>
          <button className="btn-outline" onClick={() => navigate('/tps-panel/settings')}>
            Pengaturan
          </button>
          <button className="btn-outline" onClick={handleCloseTPS}>
            Keluar
          </button>
        </div>
      </div>

      {/* Detail Modal would go here if needed */}
    </div>
  )
}

export default TPSPanelDashboard
