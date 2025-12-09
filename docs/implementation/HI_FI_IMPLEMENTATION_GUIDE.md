# 🚀 High-Fidelity Implementation Guide

Panduan cepat untuk mengintegrasikan design system high-fidelity ke dalam aplikasi PEMIRA UNIWA.

## 📦 File Structure

```
src/styles/
├── tokens.css              ← Design tokens (NEW)
├── VotingOnlineHiFi.css    ← Voting page Hi-Fi (NEW)
├── ScannerHiFi.css         ← Scanner page Hi-Fi (NEW)
├── ResultsHiFi.css         ← Results page Hi-Fi (NEW)
├── VotingOnline.css        ← Original (keep as fallback)
├── VoterQRScanner.css      ← Original (keep as fallback)
└── ElectionResults.css     ← Original (keep as fallback)
```

## 🔧 Integration Steps

### Step 1: Import Design Tokens

Add to your main CSS file or `index.css`:

```css
@import './styles/tokens.css';
```

### Step 2: Update VotingOnline Component

**Option A: Replace Completely**

```tsx
// VotingOnline.tsx
import '../styles/VotingOnlineHiFi.css'  // ← Use Hi-Fi version
```

**Option B: Feature Flag (Recommended for Testing)**

```tsx
import '../styles/VotingOnline.css'       // Fallback
import '../styles/VotingOnlineHiFi.css'   // Hi-Fi (will override)
```

### Step 3: Update Component JSX

#### Voting Online Updates

```tsx
// Before:
<div className="voting-page">
  <PageHeader title="Pemungutan Suara" />
  <div className="voting-container">
    {/* ... */}
  </div>
</div>

// After (Hi-Fi):
<div className="voting-online-page">
  <div className="voting-container">
    {/* Header Section */}
    <div className="voting-header">
      <h1 className="voting-display-title">Voting Online</h1>
      <p className="voting-subtitle">
        Pilih pasangan calon secara langsung melalui aplikasi
      </p>
    </div>

    {/* Countdown Badge */}
    <div className="countdown-badge">
      <span className="countdown-icon">⏳</span>
      <span className="countdown-text">Voting ditutup dalam:</span>
      <span className="countdown-time">{countdown}</span>
    </div>

    {/* Candidates Grid */}
    <div className="candidates-grid">
      {candidates.map((candidate, index) => (
        <div 
          key={candidate.id}
          className="candidate-card"
          style={{ '--card-index': index }}
          onClick={() => handleSelect(candidate)}
        >
          {/* Photo */}
          <div className="candidate-photo-wrapper">
            <img src={candidate.photo} className="candidate-photo" />
            <div className="candidate-badge">PASLON {candidate.number}</div>
          </div>

          {/* Info */}
          <div className="candidate-info">
            <div className="candidate-number">
              PASLON {candidate.number.toString().padStart(2, '0')}
            </div>
            <h3 className="candidate-name">{candidate.name}</h3>
            <p className="candidate-tagline">{candidate.tagline}</p>
            <button className={`candidate-button ${isSelected ? 'selected' : ''}`}>
              {isSelected ? 'DIPILIH ✓' : 'PILIH'}
            </button>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
```

#### Modal Confirmation Updates

```tsx
// Confirmation Modal (Hi-Fi)
{showModal && (
  <div className="modal-overlay" onClick={handleCloseModal}>
    <div className="confirmation-modal" onClick={(e) => e.stopPropagation()}>
      <div className="modal-icon">🗳️</div>
      
      <h2 className="modal-title">Konfirmasi Pilihan</h2>
      
      <p className="modal-message">
        Anda memilih <strong>PASLON {selectedCandidate.number}</strong>
      </p>
      
      <div className="modal-warning">
        <p className="modal-warning-text">
          Setelah mengirim, suara tidak dapat diubah.
        </p>
      </div>
      
      <div className="modal-actions">
        <button 
          className="modal-button modal-button-secondary"
          onClick={handleCancel}
        >
          Batal
        </button>
        <button 
          className="modal-button modal-button-primary"
          onClick={handleConfirm}
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Mengirim...' : 'Konfirmasi Pilihan'}
        </button>
      </div>
    </div>
  </div>
)}
```

### Step 4: Update QR Scanner Component

```tsx
// VoterQRScanner.tsx
import '../styles/ScannerHiFi.css'

// Component Structure:
<div className="scanner-page">
  {/* Header */}
  <div className="scanner-header">
    <button className="scanner-back-button" onClick={goBack}>
      ← Kembali
    </button>
    <h1 className="scanner-title">Scan QR Paslon</h1>
    <p className="scanner-subtitle">
      Arahkan kamera ke QR kecil di bawah foto paslon
    </p>
  </div>

  {/* Viewfinder */}
  <div className="scanner-viewfinder-container">
    <div className={`scanner-viewfinder ${qrDetected ? 'qr-detected' : ''}`}>
      <video ref={videoRef} className="scanner-video" />
      
      <div className="scanner-overlay">
        <div className="scanner-target">
          <div className="scanner-corner-bl" />
          <div className="scanner-corner-br" />
        </div>
        <div className="scanner-beam" />
      </div>
      
      <div className={`scanner-status ${qrDetected ? 'detected' : 'searching'}`}>
        {qrDetected ? 'QR Terdeteksi!' : 'Mencari QR...'}
      </div>
    </div>
  </div>

  {/* Manual Input */}
  <div className="scanner-manual-section">
    <label className="scanner-manual-label">Jika kamera bermasalah:</label>
    <div className="scanner-manual-input-group">
      <input 
        type="text"
        className="scanner-manual-input"
        placeholder="Masukkan kode QR"
        value={manualCode}
        onChange={(e) => setManualCode(e.target.value)}
      />
      <button 
        className="scanner-manual-button"
        onClick={handleManualSubmit}
        disabled={!manualCode}
      >
        Submit
      </button>
    </div>
  </div>
</div>
```

### Step 5: Update Results Component

```tsx
// ElectionResults.tsx
import '../styles/ResultsHiFi.css'

<div className="results-page">
  <div className="results-container">
    {/* Hero Section */}
    <div className="results-hero">
      <div className="results-hero-content">
        <div className="results-trophy">🏆</div>
        <div className="results-hero-label">PASLON TERPILIH</div>
        <h1 className="results-winner-name">
          PASLON {winner.number} — {winner.name}
        </h1>
        <p className="results-winner-votes">
          Total Suara: <span className="count">{winner.votes.toLocaleString()}</span> ({winner.percentage}%)
        </p>
      </div>
    </div>

    {/* Vote Rekapitulation */}
    <div className="results-section" style={{ '--section-delay': '0s' }}>
      <div className="results-section-header">
        <span className="results-section-icon">📊</span>
        <h2 className="results-section-title">Rekapitulasi Suara</h2>
      </div>
      
      <div className="vote-bars-container">
        {candidates.map((candidate, index) => (
          <div 
            key={candidate.id}
            className="vote-bar-row"
            style={{ '--bar-delay': `${index * 0.1}s` }}
          >
            <div className="vote-bar-label">
              PASLON {candidate.number.toString().padStart(2, '0')}
            </div>
            
            <div className="vote-bar-container">
              <div 
                className={`vote-bar ${candidate.isWinner ? 'winner' : ''}`}
                style={{ width: `${candidate.percentage}%` }}
              />
            </div>
            
            <div className="vote-bar-stats">
              <div className="vote-bar-percentage counter">
                {candidate.percentage}%
              </div>
              <div className="vote-bar-count">
                ({candidate.votes.toLocaleString()} suara)
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>

    {/* Faculty Grid */}
    <div className="results-section" style={{ '--section-delay': '0.2s' }}>
      <div className="results-section-header">
        <span className="results-section-icon">📍</span>
        <h2 className="results-section-title">Persebaran Suara per Fakultas</h2>
      </div>
      
      <div className="faculty-grid">
        {faculties.map((faculty, index) => (
          <div 
            key={faculty.id}
            className="faculty-card"
            style={{ 
              '--card-delay': `${index * 0.06}s`,
              '--faculty-color': faculty.winnerColor 
            }}
          >
            <h3 className="faculty-name">{faculty.name}</h3>
            <p className="faculty-winner">
              {faculty.winner} 
              <span className="faculty-detail">{faculty.detail}</span>
            </p>
          </div>
        ))}
      </div>
    </div>

    {/* Download Section */}
    <div className="results-download-section">
      <div className="download-icon">📥</div>
      <h3 className="download-title">Unduh Dokumen Resmi</h3>
      <p className="download-description">
        Rekap lengkap hasil pemilihan dalam format PDF
      </p>
      <button className="download-button" onClick={handleDownload}>
        <span className="download-button-icon">📄</span>
        <span className="download-button-text">Download PDF</span>
      </button>
    </div>

    {/* Publish Info */}
    <div className="results-publish-info">
      <div className="publish-info-icon">ℹ️</div>
      <p className="publish-info-text">
        Hasil dipublikasikan pada: 
        <strong className="publish-info-timestamp">{publishDate}</strong>
      </p>
    </div>
  </div>
</div>
```

## 🎨 CSS Custom Properties

Use CSS variables for dynamic values:

```tsx
// Staggered animations
{items.map((item, index) => (
  <div 
    key={item.id}
    style={{ '--card-index': index }}
  >
    {/* Card content */}
  </div>
))}

// Dynamic bar width
<div 
  className="vote-bar"
  style={{ width: `${percentage}%` }}
/>

// Dynamic colors
<div 
  className="faculty-card"
  style={{ '--faculty-color': winner === 'paslon1' ? '#4F46E5' : '#16A34A' }}
/>
```

## 🔄 Animation Triggers

### Trigger animations on mount:

```tsx
import { useEffect, useState } from 'react'

function Component() {
  const [isVisible, setIsVisible] = useState(false)
  
  useEffect(() => {
    // Delay for smoother appearance
    const timer = setTimeout(() => setIsVisible(true), 100)
    return () => clearTimeout(timer)
  }, [])
  
  return (
    <div className={isVisible ? 'animate-fade-in' : 'opacity-0'}>
      {/* Content */}
    </div>
  )
}
```

### Trigger on user action:

```tsx
const [isAnimating, setIsAnimating] = useState(false)

const handleClick = () => {
  setIsAnimating(true)
  
  // Reset after animation completes
  setTimeout(() => {
    setIsAnimating(false)
  }, 320) // Match CSS animation duration
}

<button 
  className={`btn ${isAnimating ? 'animating' : ''}`}
  onClick={handleClick}
>
  Click me
</button>
```

## 📱 Mobile Optimizations

### Add haptic feedback:

```tsx
const triggerHaptic = (type: 'light' | 'medium' | 'heavy' = 'light') => {
  if ('vibrate' in navigator) {
    const pattern = {
      light: [10],
      medium: [20],
      heavy: [30, 10, 30]
    }
    navigator.vibrate(pattern[type])
  }
}

// Usage:
<button onClick={() => {
  triggerHaptic('medium')
  handleAction()
}}>
  Submit
</button>
```

### Touch-specific styles:

```css
/* Only apply hover on devices with hover capability */
@media (hover: hover) {
  .button:hover {
    transform: translateY(-2px);
  }
}

/* Touch-specific feedback */
@media (hover: none) {
  .button:active {
    transform: scale(0.96);
  }
}
```

## ✅ Testing Checklist

- [ ] Test all animations at 60fps
- [ ] Verify reduced motion works (`prefers-reduced-motion`)
- [ ] Check mobile touch feedback
- [ ] Test on low-end devices (throttle CPU in DevTools)
- [ ] Verify all hover states work
- [ ] Check focus states for accessibility
- [ ] Test dark mode if applicable
- [ ] Verify print styles
- [ ] Check all loading states
- [ ] Test error states

## 🐛 Troubleshooting

### Animation not working?

1. Check if CSS file is imported
2. Verify class names match
3. Check CSS specificity conflicts
4. Ensure browser supports CSS features
5. Check console for errors

### Performance issues?

1. Reduce animation complexity
2. Use `will-change` sparingly
3. Debounce scroll/resize handlers
4. Check for layout thrashing
5. Use Chrome DevTools Performance tab

### Mobile issues?

1. Test on actual devices, not just simulators
2. Check touch event handlers
3. Verify viewport meta tag
4. Test on various screen sizes
5. Check iOS Safari specifically

---

**Implementation Version:** 1.0.0  
**Last Updated:** 2024-11-25  
**Developer Guide:** PEMIRA UNIWA Team
