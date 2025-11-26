import AdminLayout from '../components/admin/AdminLayout'
import { LucideIcon, type IconName } from '../components/LucideIcon'
import '../styles/AdminFlowGuide.css'

type FlowStep = {
  label: string
  detail: string
  icon?: IconName
}

type FlowTrack = {
  title: string
  subtitle: string
  badge: string
  tone: 'purple' | 'blue' | 'green' | 'orange'
  steps: FlowStep[]
}

const flowTracks: FlowTrack[] = [
  {
    title: 'Alur Besar PEMIRA',
    subtitle: 'Ringkasan ujung-ke-ujung',
    badge: 'LEVEL 1',
    tone: 'purple',
    steps: [
      { label: 'Pendaftaran Pemilih', detail: 'Mahasiswa, dosen, staf mendaftar sesuai mode pilihan.', icon: 'fileCheck' },
      { label: 'Verifikasi DPT', detail: 'Validasi identitas & penentuan hak pilih (ONLINE / TPS).', icon: 'search' },
      { label: 'Hari H Pemungutan Suara', detail: 'Online via portal atau offline di TPS.', icon: 'calendar' },
      { label: 'Rekapitulasi Suara', detail: 'Tarik suara ONLINE + TPS, audit, dan validasi.', icon: 'barChart' },
      { label: 'Publikasi Hasil', detail: 'Umumkan hasil final setelah verifikasi panitia.', icon: 'megaphone' },
    ],
  },
  {
    title: 'Pendaftaran Pemilih',
    subtitle: 'Online & TPS',
    badge: 'LEVEL 2',
    tone: 'blue',
    steps: [
      { label: 'Isi Data', detail: 'Nama, NIM/NIDN/NIP, prodi/unit, email (opsional), password.', icon: 'receipt' },
      { label: 'Pilih Mode', detail: 'ONLINE: hanya portal. TPS: akan dapat QR pendaftaran.', icon: 'target' },
      { label: 'Submit Form', detail: 'System membuat akun & status DPT sesuai mode.', icon: 'checkCircle' },
      { label: 'Hasil', detail: 'ONLINE → langsung login. TPS → tampilkan/unduh QR pendaftaran.', icon: 'ticket' },
    ],
  },
  {
    title: 'Voting Online',
    subtitle: 'Portal PEMIRA',
    badge: 'LEVEL 3',
    tone: 'green',
    steps: [
      { label: 'Login', detail: 'Validasi akun & hak pilih ONLINE.', icon: 'lock' },
      { label: 'Lihat Kandidat', detail: 'Baca profil & program kerja.', icon: 'compass' },
      { label: 'Pilih & Konfirmasi', detail: 'Kunci pilihan, kirim suara (channel=ONLINE).', icon: 'ballot' },
      { label: 'Status Tercatat', detail: 'System update voter_status & log suara.', icon: 'mapPin' },
    ],
  },
  {
    title: 'Voting TPS',
    subtitle: 'QR Pendaftaran + QR Paslon',
    badge: 'LEVEL 4',
    tone: 'orange',
    steps: [
      { label: 'Check-in', detail: 'Tunjukkan QR pendaftaran di TPS → panitia scan & approve.', icon: 'smartphone' },
      { label: 'Ambil Surat Suara', detail: 'Status checkin APPROVED, pemilih masuk bilik.', icon: 'receipt' },
      { label: 'Scan QR Paslon', detail: 'Scan QR pada surat suara → catat vote (channel=TPS).', icon: 'ballot' },
      { label: 'Selesai', detail: 'Update status VOTED, tinta jari, keluar TPS.', icon: 'checkCircle' },
    ],
  },
  {
    title: 'Rekapitulasi & Audit',
    subtitle: 'Penggabungan ONLINE + TPS',
    badge: 'LEVEL 5',
    tone: 'purple',
    steps: [
      { label: 'Tutup Voting', detail: 'Pastikan semua channel berhenti menerima suara.', icon: 'lock' },
      { label: 'Tarik Data Suara', detail: 'Kumpulkan votes ONLINE + TPS.', icon: 'download' },
      { label: 'Hitung & Segmentasi', detail: 'Total per kandidat, per fakultas, per TPS, per mode.', icon: 'trendingUp' },
      { label: 'Audit & Validasi', detail: 'Cek duplikasi/anomali, verifikasi panitia.', icon: 'shieldCheck' },
      { label: 'Publikasi', detail: 'Umumkan hasil final dan bagikan ringkasan.', icon: 'megaphone' },
    ],
  },
]

const AdminFlowGuide = (): JSX.Element => {
  return (
    <AdminLayout title="Panduan Alur Pemilihan">
      <div className="flow-page">
        <header className="flow-hero">
          <div>
            <p className="pill">Panduan</p>
            <h1>Alur Pemilihan PEMIRA</h1>
            <p className="muted">Visual sederhana untuk panitia non-teknis. Ikuti urutannya, tidak perlu membaca diagram kasar.</p>
          </div>
          <button className="btn-outline" type="button" onClick={() => window.history.back()}>
            ◀ Kembali
          </button>
        </header>

        <div className="flow-grid">
          {flowTracks.map((track) => (
            <article key={track.title} className={`flow-card tone-${track.tone}`}>
              <div className="flow-card-head">
                <span className="pill soft">{track.badge}</span>
                <div>
                  <h2>{track.title}</h2>
                  <p className="muted">{track.subtitle}</p>
                </div>
              </div>
              <ol className="flow-steps">
                {track.steps.map((step) => (
                  <li key={step.label} className="flow-step">
                    <div className="step-icon">
                      <LucideIcon name={step.icon ?? 'info'} size={20} />
                    </div>
                    <div className="step-content">
                      <p className="step-label">{step.label}</p>
                      <p className="step-detail">{step.detail}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </article>
          ))}
        </div>

        <section className="flow-callout">
          <div>
            <p className="pill soft">Tips Panitia</p>
            <h3>Checklist cepat</h3>
            <ul>
              <li>Pastikan mode pemilihan (ONLINE/TPS) sesuai jadwal election.</li>
              <li>Siapkan printer QR untuk pemilih TPS dan pastikan scanner berfungsi.</li>
              <li>Jaga hotline bantuan pada hari H untuk kendala login atau QR.</li>
            </ul>
          </div>
          <div className="callout-note">
            <strong>Butuh versi print?</strong>
            <p>Gunakan fitur cetak browser di halaman ini untuk membagikan ke panitia lapangan.</p>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminFlowGuide
