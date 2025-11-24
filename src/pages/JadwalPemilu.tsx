import type { JSX } from 'react'
import Header from '../components/Header'
import { formatIndonesianDateTime } from '../utils/dateUtils'
import '../styles/JadwalPemilu.css'

const JadwalPemilu = (): JSX.Element => {
    return (
        <div className="jadwal-pemilu-page">
            <Header />

            <main className="jadwal-container">
                <div className="jadwal-header">
                    <h1 className="jadwal-title">Jadwal Pemilihan</h1>
                    <p className="jadwal-subtitle">
                        Informasi lengkap tentang tahapan dan jadwal pemilihan BEM Universitas
                    </p>
                </div>

                <div className="jadwal-timeline">
                    <div className="timeline-phases">
                        <div className="timeline-phase active">
                            <div className="phase-dot"></div>
                            <div className="phase-content">
                                <h3 className="phase-title">Pendaftaran</h3>
                                <p className="phase-desc">Pendaftaran pemilu untuk mahasiswa, dosen, dan staf UNIWA</p>
                                <div className="phase-dates">
                                    <div className="date-range">
                                        <div className="date-item">
                                            <span className="date-label">Mulai:</span>
                                            <span className="date-value">{formatIndonesianDateTime('01/11/2025, 08.00')}</span>
                                        </div>
                                        <div className="date-item">
                                            <span className="date-label">Selesai:</span>
                                            <span className="date-value">{formatIndonesianDateTime('30/11/2025, 16.00')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="timeline-phase upcoming">
                            <div className="phase-dot"></div>
                            <div className="phase-content">
                                <h3 className="phase-title">Verifikasi Berkas</h3>
                                <p className="phase-desc">Verifikasi dokumen dan berkas pemilu</p>
                                <div className="phase-dates">
                                    <div className="date-range">
                                        <div className="date-item">
                                            <span className="date-label">Mulai:</span>
                                            <span className="date-value">{formatIndonesianDateTime('01/12/2025, 08.00')}</span>
                                        </div>
                                        <div className="date-item">
                                            <span className="date-label">Selesai:</span>
                                            <span className="date-value">{formatIndonesianDateTime('07/12/2025, 18.00')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="timeline-phase upcoming">
                            <div className="phase-dot"></div>
                            <div className="phase-content">
                                <h3 className="phase-title">Kampanye</h3>
                                <p className="phase-desc">Periode kampanye kandidat</p>
                                <div className="phase-dates">
                                    <div className="date-range">
                                        <div className="date-item">
                                            <span className="date-label">Mulai:</span>
                                            <span className="date-value">{formatIndonesianDateTime('08/12/2025, 08.00')}</span>
                                        </div>
                                        <div className="date-item">
                                            <span className="date-label">Selesai:</span>
                                            <span className="date-value">{formatIndonesianDateTime('10/12/2025, 20.00')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="timeline-phase upcoming">
                            <div className="phase-dot"></div>
                            <div className="phase-content">
                                <h3 className="phase-title">Masa Tenang</h3>
                                <p className="phase-desc">Masa tenang sebelum pemungutan suara</p>
                                <div className="phase-dates">
                                    <div className="date-range">
                                        <div className="date-item">
                                            <span className="date-label">Mulai:</span>
                                            <span className="date-value">{formatIndonesianDateTime('11/12/2025, 00.00')}</span>
                                        </div>
                                        <div className="date-item">
                                            <span className="date-label">Selesai:</span>
                                            <span className="date-value">{formatIndonesianDateTime('14/12/2025, 23.59')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="timeline-phase upcoming">
                            <div className="phase-dot"></div>
                            <div className="phase-content">
                                <h3 className="phase-title">Voting</h3>
                                <p className="phase-desc">Proses pemungutan suara online</p>
                                <div className="phase-dates">
                                    <div className="date-range">
                                        <div className="date-item">
                                            <span className="date-label">Mulai:</span>
                                            <span className="date-value">{formatIndonesianDateTime('15/12/2025, 06.25')}</span>
                                        </div>
                                        <div className="date-item">
                                            <span className="date-label">Selesai:</span>
                                            <span className="date-value">{formatIndonesianDateTime('17/12/2025, 19.48')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="timeline-phase upcoming">
                            <div className="phase-dot"></div>
                            <div className="phase-content">
                                <h3 className="phase-title">Rekapitulasi</h3>
                                <p className="phase-desc">Pengumuman hasil akhir pemilihan</p>
                                <div className="phase-dates">
                                    <div className="date-range">
                                        <div className="date-item">
                                            <span className="date-label">Mulai:</span>
                                            <span className="date-value">{formatIndonesianDateTime('21/12/2025, 08.00')}</span>
                                        </div>
                                        <div className="date-item">
                                            <span className="date-label">Selesai:</span>
                                            <span className="date-value">{formatIndonesianDateTime('22/12/2025, 17.00')}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="jadwal-footer">
                    <div className="jadwal-note">
                        <h3 className="note-title">Informasi Penting</h3>
                        <ul className="note-list">
                            <li>Jadwal dapat berubah sesuai dengan keputusan panitia pemilihan</li>
                            <li>Pastikan untuk memantau pengumuman resmi dari panitia</li>
                            <li>Semua waktu menggunakan WIB (Waktu Indonesia Barat)</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    )
}

export default JadwalPemilu