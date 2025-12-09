# Wireframe to Code Mapping

Mapping antara wireframe yang diberikan dengan implementasi kode.

## 🟩 1. HALAMAN VOTING ONLINE

### Wireframe Elements → Code Components

```
+--------------------------------------------------------------+
| [Logo PEMIRA]                               [Profil Pemilih] |
```
**Code:** `<PageHeader title='🗳 PEMILIHAN ONLINE...' user={mahasiswa} />`
**File:** `src/components/shared/PageHeader.tsx`

```
| Status Pemilih:  BELUM MEMILIH                              |
| Waktu Tersisa:   02:31:58  (Countdown Real-time)             |
```
**Code:** 
```tsx
<div className="voting-status-bar">
  <div className="status-item">
    <span className="status-label">Status Pemilih:</span>
    <span className="status-value status-belum">
      {hasVoted ? 'SUDAH MEMILIH' : 'BELUM MEMILIH'}
    </span>
  </div>
  <div className="status-item">
    <span className="status-label">Waktu Tersisa:</span>
    <span className="status-value status-timer">02:31:58</span>
  </div>
</div>
```
**File:** `src/pages/VotingOnline.tsx` (lines ~133-146)

```
| [ KOTAK PASLON 01 ]                                          |
|  Foto Ketua & Wakil                                          |
|  "Paslon 01"                                                 |
|  Ringkas visi & misi                                         |
|  [ PILIH ]                                                   |
```
**Code:**
```tsx
<div className="kandidat-voting-card" onClick={() => handleSelectKandidat(kandidat)}>
  <div className="kandidat-hero">
    <div className="kandidat-photo">
      <img src={...} alt={kandidat.nama} />
    </div>
    <div className="kandidat-info">
      <div className="candidate-number">PASLON {kandidat.nomorUrut}</div>
      <h3>{kandidat.nama}</h3>
      <p className="visi-ringkas">Visi & Misi: ...</p>
    </div>
  </div>
  <button className="btn-select">PILIH</button>
</div>
```
**File:** `src/pages/VotingOnline.tsx` (lines ~161-183)

```
Modal Konfirmasi:
Anda memilih PASLON 02.
Setelah mengirim, suara tidak dapat diubah.
[BATAL]   [KIRIM SUARA]
```
**Code:**
```tsx
<div className="confirmation-modal">
  <h2>Konfirmasi Pilihan</h2>
  <p className="confirmation-text">
    Anda memilih <strong>PASLON {selectedKandidat.nomorUrut}</strong>.
  </p>
  <p className="confirmation-warning">
    Setelah mengirim, suara tidak dapat diubah.
  </p>
  <div className="confirmation-actions">
    <button onClick={handleKembali}>BATAL</button>
    <button onClick={handleKirimSuara}>KIRIM SUARA</button>
  </div>
</div>
```
**File:** `src/pages/VotingOnline.tsx` (lines ~194-215)

---

## 🟩 2. HALAMAN SCAN QR PASLON (DEVICE PEMILIH)

### Wireframe Elements → Code Components

```
| < Kembali                        Scan QR Paslon Hasil Coblos |
```
**Code:**
```tsx
<div className="scanner-header">
  <button className="btn-back" onClick={() => navigate('/voting-tps')}>
    &lt; Kembali
  </button>
  <h1>Scan QR Paslon Hasil Coblos</h1>
</div>
```
**File:** `src/pages/VoterQRScanner.tsx` (lines ~137-142)

```
|  Instruksi:                                                  |
|  - Arahkan kamera ke QR kecil di bawah foto paslon.          |
|  - Pastikan QR terlihat jelas dan tidak terlipat.            |
```
**Code:**
```tsx
<div className="scanner-instructions">
  <h2>Instruksi:</h2>
  <ul>
    <li>Arahkan kamera ke QR kecil di bawah foto paslon.</li>
    <li>Pastikan QR terlihat jelas dan tidak terlipat.</li>
  </ul>
</div>
```
**File:** `src/pages/VoterQRScanner.tsx` (lines ~147-154)

```
| [ FRAME KAMERA BESAR ]                                       |
|   Area kamera scanning QR Paslon                             |
```
**Code:**
```tsx
<div className="scanner-camera-frame">
  <video ref={videoRef} autoPlay playsInline muted className="scanner-video" />
  {isScanning && (
    <div className="scanner-overlay">
      <div className="scanner-target" />
      <p className="scanner-hint">Arahkan QR ke kotak ini</p>
    </div>
  )}
</div>
```
**File:** `src/pages/VoterQRScanner.tsx` (lines ~157-168)

```
| Jika kamera bermasalah:                                      |
| [ MASUKKAN KODE QR MANUAL ]                                  |
```
**Code:**
```tsx
<div className="manual-input-section">
  <p>Jika kamera bermasalah:</p>
  <div className="manual-input-group">
    <input type="text" placeholder="Masukkan kode QR manual" 
           value={manualCode} onChange={...} />
    <button onClick={handleManualSubmit}>Submit</button>
  </div>
</div>
```
**File:** `src/pages/VoterQRScanner.tsx` (lines ~178-191)

```
Konfirmasi:
✔ QR Terbaca
Paslon yang Anda coblos:
PASLON 02 – Budi & Rian
[ KIRIM SUARA ]
[ BATAL / ULANG SCAN ]
```
**Code:**
```tsx
<div className="scan-confirmation">
  <div className="confirmation-icon">✔</div>
  <h2>QR Terbaca</h2>
  <h3>Paslon yang Anda coblos:</h3>
  <div className="candidate-info-box">
    <div className="candidate-number">PASLON {nomorUrut}</div>
    <div className="candidate-name">{nama}</div>
  </div>
  <button onClick={handleSubmitVote}>KIRIM SUARA</button>
  <button onClick={handleCancelScan}>BATAL / ULANG SCAN</button>
</div>
```
**File:** `src/pages/VoterQRScanner.tsx` (lines ~195-225)

---

## 🟦 3. HALAMAN HASIL PEMILIHAN FINAL

### Wireframe Elements → Code Components

```
| 🏆 Pasangan Terpilih:                                        |
|     PASLON 02 — Budi & Rian                                  |
|     Perolehan: 3.812 Suara (56%)                             |
```
**Code:**
```tsx
<div className="winner-section">
  <div className="trophy-icon">🏆</div>
  <h1>Pasangan Terpilih</h1>
  <div className="winner-name">
    PASLON {winner.nomorUrut} — {winner.nama}
  </div>
  <div className="winner-votes">
    Perolehan: {winner.totalVotes.toLocaleString()} Suara ({winner.percentage}%)
  </div>
</div>
```
**File:** `src/pages/ElectionResults.tsx` (lines ~83-96)

```
| 📊 Rekapitulasi Suara                                         |
|  PASLON 01   | ████████████████░░░░░░   44% (3.010 suara)    |
|  PASLON 02   | ██████████████████████   56% (3.812 suara)    |
```
**Code:**
```tsx
<div className="rekapitulasi-section">
  <h2><span className="section-icon">📊</span> Rekapitulasi Suara</h2>
  {results.candidates.map((candidate) => (
    <div className="candidate-result-row">
      <div className="candidate-result-label">PASLON {candidate.nomorUrut}</div>
      <div className="candidate-result-bar-container">
        <div className="candidate-result-bar" 
             style={{ width: `${candidate.percentage}%` }} />
      </div>
      <div className="candidate-result-stats">
        {candidate.percentage}% ({candidate.totalVotes.toLocaleString()} suara)
      </div>
    </div>
  ))}
</div>
```
**File:** `src/pages/ElectionResults.tsx` (lines ~99-122)

```
| 📍 Persebaran Suara per Fakultas                             |
|  FTI       | Paslon 02 unggul                                |
|  FIKES     | Paslon 01 unggul tipis                           |
```
**Code:**
```tsx
<div className="faculty-section">
  <h2><span className="section-icon">📍</span> Persebaran Suara per Fakultas</h2>
  <div className="faculty-grid">
    {results.facultyResults.map((faculty) => (
      <div className="faculty-card">
        <div className="faculty-name">{faculty.fakultas}</div>
        <div className="faculty-winner">
          {faculty.winner} <span className="faculty-detail">{faculty.detail}</span>
        </div>
      </div>
    ))}
  </div>
</div>
```
**File:** `src/pages/ElectionResults.tsx` (lines ~125-141)

```
| 📥 Unduh Dokumen Resmi Rekapitulasi (PDF)                    |
| [ DOWNLOAD PDF ]                                             |
```
**Code:**
```tsx
<div className="download-section">
  <h3><span className="section-icon">📥</span> 
      Unduh Dokumen Resmi Rekapitulasi (PDF)</h3>
  <button className="btn-download" onClick={handleDownloadPDF}>
    DOWNLOAD PDF
  </button>
</div>
```
**File:** `src/pages/ElectionResults.tsx` (lines ~144-151)

---

## 📊 Component Hierarchy

```
VotingOnline
├── PageHeader
├── voting-status-bar (NEW)
├── progress-steps
├── voting-step
│   ├── kandidat-voting-grid
│   │   └── kandidat-voting-card[] (clickable)
│   └── confirmation-modal (NEW - triggered on click)
└── voting-result (success state)

VoterQRScanner (NEW PAGE)
├── scanner-header (with back button)
├── scanner-instructions
├── scanner-camera-frame
│   ├── video (QR scanning)
│   └── scanner-overlay (target box)
├── manual-input-section
└── scan-confirmation (after successful scan)
    ├── candidate-info-box
    └── confirmation-actions

ElectionResults (NEW PAGE)
├── PageHeader
├── winner-section (hero announcement)
├── rekapitulasi-section
│   └── candidate-result-row[]
│       ├── candidate-result-label
│       ├── candidate-result-bar (animated)
│       └── candidate-result-stats
├── faculty-section
│   └── faculty-grid
│       └── faculty-card[]
└── download-section
    └── btn-download
```

## 🎨 CSS Classes Reference

### VotingOnline Classes:
- `.voting-status-bar` - Status & timer bar
- `.status-item` - Individual status field
- `.status-belum` / `.status-timer` - Badge variants
- `.confirmation-modal` - Simple modal dialog
- `.visi-ringkas` - Short vision text

### VoterQRScanner Classes:
- `.voter-qr-scanner-page` - Page wrapper
- `.scanner-camera-frame` - Video container
- `.scanner-target` - QR target box (animated)
- `.scan-confirmation` - Confirmation state
- `.candidate-info-box` - Selected candidate display

### ElectionResults Classes:
- `.winner-section` - Hero section with gradient
- `.trophy-icon` - Animated trophy
- `.candidate-result-bar` - Animated progress bar
- `.faculty-grid` - Responsive grid layout
- `.btn-download` - Download CTA button

---

## 🔄 State Management

### VotingOnline State:
```tsx
const [step, setStep] = useState<VotingStep>(1)
const [selectedKandidat, setSelectedKandidat] = useState<Candidate | null>(null)
const [isSubmitting, setIsSubmitting] = useState(false)
const [votingResult, setVotingResult] = useState<VotingReceipt | null>(null)
```

### VoterQRScanner State:
```tsx
const [isScanning, setIsScanning] = useState(false)
const [error, setError] = useState<string | null>(null)
const [manualCode, setManualCode] = useState('')
const [scannedCandidate, setScannedCandidate] = useState<CandidateInfo | null>(null)
const [isSubmitting, setIsSubmitting] = useState(false)
```

### ElectionResults State:
```tsx
const [results, setResults] = useState<ElectionResultsData | null>(null)
const [isLoading, setIsLoading] = useState(true)
```

---

## 📱 Mobile Responsive Breakpoints

All pages use consistent breakpoints:
- **Desktop:** > 968px - Full layout
- **Tablet:** 768px - 968px - Adjusted grid/spacing
- **Mobile:** < 768px - Single column, stacked elements

Media queries are in respective CSS files.

