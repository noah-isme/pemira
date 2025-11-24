import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useTPSPanelStore } from '../hooks/useTPSPanelStore'
import '../styles/TPSPanel.css'

const TPSVoterDetail = (): JSX.Element => {
    const navigate = useNavigate()
    const { id } = useParams<{ id: string }>()
    const { queue } = useTPSPanelStore()

    const voter = queue.find(item => item.id === id)

    if (!voter) {
        return (
            <div className="tps-panel-page">
                <div className="panel-shell">
                    <div className="error-state">
                        <h1>Pemilih tidak ditemukan</h1>
                        <button className="btn-primary" onClick={() => navigate('/tps-panel')}>
                            Kembali ke Dashboard
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    const formatTime = (timeString: string) => {
        return new Date(timeString).toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        })
    }

    return (
        <div className="tps-panel-page">
            <div className="panel-shell">
                {/* Header */}
                <div className="detail-header">
                    <button className="btn-ghost back-btn" onClick={() => navigate('/tps-panel')}>
                        ← Kembali
                    </button>
                    <h1>{voter.nama}</h1>
                </div>

                {/* Voter Details */}
                <div className="voter-detail-card">
                    <div className="detail-section">
                        <h3>Informasi Pemilih</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Nama Lengkap</label>
                                <span>{voter.nama}</span>
                            </div>
                            <div className="detail-item">
                                <label>NIM</label>
                                <span>{voter.nim}</span>
                            </div>
                            <div className="detail-item">
                                <label>Program Studi</label>
                                <span>{voter.prodi}</span>
                            </div>
                            <div className="detail-item">
                                <label>Fakultas</label>
                                <span>{voter.fakultas}</span>
                            </div>
                            <div className="detail-item">
                                <label>Angkatan</label>
                                <span>{voter.angkatan}</span>
                            </div>
                            <div className="detail-item">
                                <label>Status Mahasiswa</label>
                                <span>{voter.statusMahasiswa}</span>
                            </div>
                        </div>
                    </div>

                    <div className="detail-section">
                        <h3>Status Voting</h3>
                        <div className="detail-grid">
                            <div className="detail-item">
                                <label>Status</label>
                                <span className={`status-badge ${voter.status.toLowerCase()}`}>
                                    {voter.status === 'VOTED' ? 'SUDAH VOTING' : 'CHECKED_IN'}
                                </span>
                            </div>
                            <div className="detail-item">
                                <label>Waktu Check-in</label>
                                <span>{formatTime(voter.waktuCheckIn)}</span>
                            </div>
                            {voter.voteTime && (
                                <div className="detail-item">
                                    <label>Waktu Voting</label>
                                    <span>{formatTime(voter.voteTime)}</span>
                                </div>
                            )}
                            <div className="detail-item">
                                <label>Mode Voting</label>
                                <span>{voter.mode === 'mobile' ? 'Di Perangkat Sendiri' : 'Di TPS'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Notes Section - For internal panitia notes */}
                <div className="notes-section">
                    <h3>Catatan Panitia</h3>
                    <textarea
                        className="notes-textarea"
                        placeholder="Catatan internal panitia (opsional)..."
                        rows={4}
                    />
                </div>
            </div>
        </div>
    )
}

export default TPSVoterDetail