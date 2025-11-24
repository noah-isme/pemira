import React from 'react'
import { useNavigate } from 'react-router-dom'
import '../styles/TPSPanel.css'

const TPSCheckInSuccess = (): JSX.Element => {
    const navigate = useNavigate()

    // In a real implementation, this would get voter data from URL params or state
    const mockVoterData = {
        nama: 'Roni Saputra',
        nim: '21034567',
        prodi: 'Teknik Informatika',
        status: 'CHECKED_IN'
    }

    const handleBackToDashboard = () => {
        navigate('/tps-panel')
    }

    return (
        <div className="tps-panel-page">
            <div className="panel-shell">
                {/* Success Header */}
                <div className="success-header">
                    <div className="success-icon">✔</div>
                    <h1>Pemilih Berhasil Check-in</h1>
                </div>

                {/* Voter Details */}
                <div className="voter-details-card">
                    <div className="detail-row">
                        <span className="detail-label">Nama</span>
                        <span className="detail-value">{mockVoterData.nama}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">NIM</span>
                        <span className="detail-value">{mockVoterData.nim}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Prodi</span>
                        <span className="detail-value">{mockVoterData.prodi}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Status</span>
                        <span className={`detail-value status-${mockVoterData.status.toLowerCase()}`}>
                            {mockVoterData.status}
                        </span>
                    </div>
                </div>

                {/* Instructions */}
                <div className="instructions-card">
                    <p>Berikan surat suara fisik kepada pemilih.</p>
                    <p>Pemilih akan melanjutkan proses di perangkatnya sendiri.</p>
                </div>

                {/* Action Button */}
                <div className="action-section">
                    <button className="btn-primary btn-large" onClick={handleBackToDashboard}>
                        Kembali ke Dashboard
                    </button>
                </div>
            </div>
        </div>
    )
}

export default TPSCheckInSuccess