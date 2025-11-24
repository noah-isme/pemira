import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTPSPanelStore } from '../hooks/useTPSPanelStore'
import { usePopup } from '../components/Popup'
import '../styles/TPSPanel.css'

const TPSPanelSettings = (): JSX.Element => {
    const navigate = useNavigate()
    const { panelInfo, setPanelStatus } = useTPSPanelStore()
    const { showPopup } = usePopup()

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
        navigate('/')
    }

    const handleDownloadAttendance = () => {
        // In a real implementation, this would generate and download attendance data
        alert('Download daftar hadir akan diimplementasikan')
    }

    return (
        <div className="tps-panel-page">
            <div className="panel-shell">
                {/* Header */}
                <div className="settings-header">
                    <button className="btn-ghost back-btn" onClick={() => navigate('/tps-panel')}>
                        ← Kembali
                    </button>
                    <h1>{panelInfo.tpsName} - Pengaturan</h1>
                </div>

                {/* TPS Information */}
                <div className="settings-section">
                    <h2>Informasi TPS</h2>
                    <div className="info-card">
                        <div className="info-row">
                            <span className="info-label">Nama TPS</span>
                            <span className="info-value">{panelInfo.tpsName}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Kode TPS</span>
                            <span className="info-value">{panelInfo.tpsCode}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Lokasi</span>
                            <span className="info-value">{panelInfo.lokasi}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Status</span>
                            <span className="info-value">{panelInfo.status}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Jam Operasional</span>
                            <span className="info-value">{panelInfo.jamOperasional}</span>
                        </div>
                        <div className="info-row">
                            <span className="info-label">Total Pemilih</span>
                            <span className="info-value">{panelInfo.totalVoters}</span>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="settings-section">
                    <h2>Aksi</h2>
                    <div className="action-buttons-grid">
                        <button className="btn-outline" onClick={handleDownloadAttendance}>
                            Download Daftar Hadir
                        </button>
                        <button className="btn-outline">
                            Mode Gelap / Terang
                        </button>
                        <button className="btn-danger" onClick={handleCloseTPS}>
                            Keluar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TPSPanelSettings