import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrowserQRCodeReader } from '@zxing/library'
import { useVotingSession } from '../hooks/useVotingSession'
import '../styles/VoterQRScanner.css'

const VoterQRScanner = (): JSX.Element => {
  const navigate = useNavigate()
  const { session } = useVotingSession()
  const videoRef = useRef<HTMLVideoElement>(null)
  
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [manualCode, setManualCode] = useState('')
  const [scannedCandidate, setScannedCandidate] = useState<{
    id: number
    nama: string
    nomorUrut: number
  } | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const restartRef = useRef<() => Promise<void>>()

  const stopScanning = useCallback(() => {
    setIsScanning(false)
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((track) => track.stop())
    }
  }, [])

  const handleQRCode = useCallback(
    async (qrData: string) => {
      try {
        stopScanning()

        const parts = qrData.split(':')
        if (parts[0] === 'CANDIDATE' && parts.length >= 4) {
          setScannedCandidate({
            id: Number.parseInt(parts[1], 10),
            nomorUrut: Number.parseInt(parts[2], 10),
            nama: parts.slice(3).join(':'),
          })
        } else {
          setError('QR code tidak valid. Silakan scan ulang.')
          setTimeout(() => {
            setError(null)
            void restartRef.current?.()
          }, 3000)
        }
      } catch (err) {
        console.error('Parse QR error:', err)
        setError('Gagal membaca QR code. Silakan coba lagi.')
        setTimeout(() => {
          setError(null)
          void restartRef.current?.()
        }, 3000)
      }
    },
    [stopScanning],
  )

  const startScanning = useCallback(async () => {
    if (!videoRef.current) return

    try {
      setIsScanning(true)
      setError(null)

      const codeReader = new BrowserQRCodeReader()
      const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoRef.current)

      if (result) {
        await handleQRCode(result.getText())
      }
    } catch (err) {
      console.error('QR scan error:', err)
      setError('Gagal mengakses kamera. Pastikan izin kamera diberikan.')
      setIsScanning(false)
    }
  }, [handleQRCode])

  useEffect(() => {
    restartRef.current = startScanning
    startScanning()
    return () => {
      stopScanning()
    }
  }, [startScanning, stopScanning])

  const handleManualSubmit = async () => {
    if (!manualCode.trim()) return
    await handleQRCode(manualCode.trim())
  }

  const handleCancelScan = () => {
    setScannedCandidate(null)
    setError(null)
    void startScanning()
  }

  const handleSubmitVote = async () => {
    if (!scannedCandidate || isSubmitting) return

    setIsSubmitting(true)

    // Simulate API call
    setTimeout(() => {
      navigate('/voting-tps/success', {
        state: {
          candidate: scannedCandidate,
          timestamp: new Date().toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          }),
        },
      })
    }, 2000)
  }

  if (!session) {
    navigate('/login', { replace: true })
    return <></>
  }

  return (
    <div className="voter-qr-scanner-page">
      <div className="scanner-shell">
        {/* Header */}
        <div className="scanner-header">
          <button className="btn-back" onClick={() => navigate('/voting-tps')}>
            &lt; Kembali
          </button>
          <h1>Scan QR Paslon Hasil Coblos</h1>
        </div>

        {!scannedCandidate ? (
          <>
            {/* Instructions */}
            <div className="scanner-instructions">
              <h2>Instruksi:</h2>
              <ul>
                <li>Arahkan kamera ke QR kecil di bawah foto paslon.</li>
                <li>Pastikan QR terlihat jelas dan tidak terlipat.</li>
              </ul>
            </div>

            {/* Camera Frame */}
            <div className="scanner-camera-frame">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="scanner-video"
              />
              {isScanning && (
                <div className="scanner-overlay">
                  <div className="scanner-target" />
                  <p className="scanner-hint">Arahkan QR ke kotak ini</p>
                </div>
              )}
              {!isScanning && !error && (
                <div className="scanner-placeholder">
                  <p>Mempersiapkan kamera...</p>
                </div>
              )}
              {error && (
                <div className="scanner-error">
                  <p>⚠️ {error}</p>
                </div>
              )}
            </div>

            {/* Manual Input */}
            <div className="manual-input-section">
              <p>Jika kamera bermasalah:</p>
              <div className="manual-input-group">
                <input
                  type="text"
                  placeholder="Masukkan kode QR manual"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  className="manual-input"
                />
                <button
                  className="btn-manual-submit"
                  onClick={handleManualSubmit}
                  disabled={!manualCode.trim()}
                >
                  Submit
                </button>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Confirmation */}
            <div className="scan-confirmation">
              <div className="confirmation-icon">✔</div>
              <h2>QR Terbaca</h2>
              
              <div className="confirmation-candidate">
                <h3>Paslon yang Anda coblos:</h3>
                <div className="candidate-info-box">
                  <div className="candidate-number">
                    PASLON {scannedCandidate.nomorUrut.toString().padStart(2, '0')}
                  </div>
                  <div className="candidate-name">{scannedCandidate.nama}</div>
                </div>
              </div>

              <div className="confirmation-warning">
                <p>
                  Setelah Anda menekan tombol di bawah ini, suara akan
                  tercatat di sistem PEMIRA dan Anda tidak dapat mengubahnya.
                </p>
              </div>

              <div className="confirmation-actions">
                <button
                  className="btn-primary-large"
                  onClick={handleSubmitVote}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Mengirim...' : 'KIRIM SUARA'}
                </button>
                <button className="btn-secondary-outline" onClick={handleCancelScan}>
                  BATAL / ULANG SCAN
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default VoterQRScanner
