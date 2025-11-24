# Quick Reference - Voting Pages

## 🚀 Quick Start

```bash
npm run dev
# Visit: http://localhost:5173
```

## 📍 Routes

| Route | Page | Access |
|-------|------|--------|
| `/voting` | Voting Online | Auth Required |
| `/voting-tps/scan-candidate` | QR Scanner (TPS) | Auth Required |
| `/hasil` | Election Results | Public |

## 🎯 Features by Page

### 1. Voting Online (`/voting`)
```
✅ Status bar (BELUM MEMILIH / SUDAH MEMILIH)
✅ Countdown timer (real-time)
✅ Kandidat cards with photos & vision
✅ Click to vote → Modal confirmation
✅ Submit vote → Success redirect
```

### 2. QR Scanner (`/voting-tps/scan-candidate`)
```
✅ Camera frame for QR scanning
✅ Instructions overlay
✅ Manual input fallback
✅ Candidate confirmation screen
✅ Submit → TPS success page
```

### 3. Election Results (`/hasil`)
```
✅ Winner announcement (trophy icon)
✅ Bar chart visualization
✅ Faculty breakdown grid
✅ Download PDF button
✅ Publish timestamp
```

## 🎨 Design Tokens

```css
/* Colors */
--primary: #667eea → #764ba2
--success: #48bb78 → #38a169
--warning: #fc8181
--bg: #f6f8fb → #e9ecef

/* Breakpoints */
Desktop: > 968px
Tablet:  768px - 968px
Mobile:  < 768px

/* Animations */
fadeIn: 0.4s ease
pulse: 2s ease-in-out infinite
bounce: 2s ease-in-out infinite
```

## 💻 Key Components

### Voting Online
```tsx
<VotingOnline>
  <voting-status-bar />
  <kandidat-voting-grid>
    <kandidat-voting-card onClick={select} />
  </kandidat-voting-grid>
  <confirmation-modal />
</VotingOnline>
```

### QR Scanner
```tsx
<VoterQRScanner>
  <scanner-camera-frame>
    <video ref={videoRef} />
    <scanner-overlay />
  </scanner-camera-frame>
  <manual-input-section />
  <scan-confirmation />
</VoterQRScanner>
```

### Results
```tsx
<ElectionResults>
  <winner-section />
  <rekapitulasi-section>
    <candidate-result-bar />
  </rekapitulasi-section>
  <faculty-section />
  <download-section />
</ElectionResults>
```

## 🔧 State Patterns

```tsx
// Voting Online
const [step, setStep] = useState<1 | 2 | 3>(1)
const [selectedKandidat, setSelectedKandidat] = useState<Candidate | null>(null)

// QR Scanner
const [scannedCandidate, setScannedCandidate] = useState<CandidateInfo | null>(null)
const [isScanning, setIsScanning] = useState(false)

// Results
const [results, setResults] = useState<ElectionResultsData | null>(null)
const [isLoading, setIsLoading] = useState(true)
```

## 📦 Data Flow

### Voting Flow
```
User clicks kandidat
  ↓
Modal shows
  ↓
User confirms
  ↓
POST /api/votes
  ↓
Success → Dashboard
```

### TPS QR Flow
```
Camera scans QR
  ↓
Parse QR data
  ↓
Show confirmation
  ↓
User submits
  ↓
POST /api/votes/tps
  ↓
Success page
```

### Results Flow
```
Page loads
  ↓
GET /api/results/current
  ↓
Display winner + charts
  ↓
User downloads PDF
```

## 🧪 Testing Commands

```bash
# Build
npm run build

# Dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint
```

## 📝 Mock Data Locations

```typescript
// Voting Online
src/data/mockCandidates.ts

// QR Scanner
QR Format: "CANDIDATE:ID:NOMOR_URUT:NAMA"

// Results
mockResultsData in src/pages/ElectionResults.tsx
```

## 🎓 Common Tasks

### Add New Candidate
```typescript
// src/data/mockCandidates.ts
{
  id: 3,
  nomorUrut: 3,
  nama: "Citra & Dani",
  fakultas: "FTI",
  prodi: "Informatika",
  // ...
}
```

### Customize Timer
```typescript
// VotingOnline.tsx line ~146
<span className="status-value status-timer">
  {countdown} {/* Update with real countdown */}
</span>
```

### Change Results Display
```typescript
// ElectionResults.tsx
const mockResultsData = {
  totalVotes: 6822,
  candidates: [...],
  facultyResults: [...]
}
```

## 🔗 Related Files

```
Pages:
├── src/pages/VotingOnline.tsx
├── src/pages/VoterQRScanner.tsx
└── src/pages/ElectionResults.tsx

Styles:
├── src/styles/VotingOnline.css
├── src/styles/VoterQRScanner.css
└── src/styles/ElectionResults.css

Routes:
└── src/router/routes.ts

Docs:
├── VOTING_PAGES_IMPLEMENTATION.md
├── WIREFRAME_TO_CODE_MAPPING.md
└── IMPLEMENTATION_SUMMARY.md
```

## 🐛 Common Issues

### QR Scanner not working?
```bash
# Check camera permissions
# Use manual input as fallback
# Test with QR format: CANDIDATE:1:01:Ahmad & Siti
```

### Modal not showing?
```typescript
// Check selectedKandidat state
// Verify step === 2
console.log({ step, selectedKandidat })
```

### Results not loading?
```typescript
// Check mock data
// Verify isLoading state
// Add error boundary
```

## 📚 Full Documentation

- `VOTING_PAGES_IMPLEMENTATION.md` - Complete feature guide
- `WIREFRAME_TO_CODE_MAPPING.md` - Wireframe → code mapping
- `IMPLEMENTATION_SUMMARY.md` - Implementation checklist

---

**Quick Links:**
- [Voting Online](/voting)
- [QR Scanner](/voting-tps/scan-candidate)
- [Results](/hasil)

**Need Help?** Check full documentation files above.
