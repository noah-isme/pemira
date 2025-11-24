import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BrowserQRCodeReader } from '@zxing/library'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useTPSPanelStore } from '../hooks/useTPSPanelStore'
import '../styles/TPSPanel.css'

const TPSQRScanner = (): JSX.Element => {
    const navigate = useNavigate()
    const { token } = useAdminAuth()
    const [searchParams] = useSearchParams()
    const tpsIdParam = searchParams.get('tpsId') ?? undefined
    const { panelInfo, checkInVoter } = useTPSPanelStore()

    const videoRef = useRef<HTMLVideoElement>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [manualCode, setManualCode] = useState('')

    useEffect(() => {
        startScanning()
        return () => {
            stopScanning()
        }
    }, [])

    const startScanning = async () => {
        if (!videoRef.current) return

        try {
            setIsScanning(true)
            setError(null)

            const codeReader = new BrowserQRCodeReader()
            const result = await codeReader.decodeOnceFromVideoDevice(undefined, videoRef.current)

            if (result) {
                await handleQRCode()
            }
        } catch (err) {
            console.error('QR scan error:', err)
            setError('Gagal mengakses kamera. Pastikan izin kamera diberikan.')
            setIsScanning(false)
        }
    }

    const stopScanning = () => {
        setIsScanning(false)
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
        }
    }

    const handleQRCode = async () => {
        try {
            stopScanning()

            // Validate QR format and check-in voter
            if (token && tpsIdParam) {
                const success = await checkInVoter()
                if (success) {
                    navigate('/tps-panel/checkin-success')
                } else {
                    setError('QR code tidak valid atau pemilih sudah check-in.')
                    setTimeout(() => startScanning(), 3000)
                }
            }
        } catch (err) {
            console.error('Check-in error:', err)
            setError('Gagal melakukan check-in. Silakan coba lagi.')
            setTimeout(() => startScanning(), 3000)
        }
    }

    const handleManualSubmit = async () => {
        if (!manualCode.trim()) return
        await handleQRCode(manualCode.trim())
    }

    return (
        <div className="tps-panel-page">
            <div className="panel-shell">
                {/* Header */}
                <div className="scanner-header">
                    <button className="btn-ghost back-btn" onClick={() => navigate('/tps-panel')}>
                        ← Kembali
                    </button>
                    <h1>{panelInfo.tpsName} - Scan QR Pemilih</h1>
                </div>

                {/* Camera Frame */}
                <div className="scanner-frame">
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
                        </div>
                    )}
                    {!isScanning && !error && (
                        <div className="scanner-placeholder">
                            <p>Mempersiapkan kamera...</p>
                        </div>
                    )}
                    {error && (
                        <div className="scanner-error">
                            <p>{error}</p>
                        </div>
                    )}
                </div>

                {/* Manual Input */}
                <div className="manual-input-section">
                    <p>Jika QR gagal:</p>
                    <div className="manual-input-group">
                        <input
                            type="text"
                            placeholder="Masukkan kode QR manual"
                            value={manualCode}
                            onChange={(e) => setManualCode(e.target.value)}
                            className="manual-input"
                        />
                        <button
                            className="btn-primary"
                            onClick={handleManualSubmit}
                            disabled={!manualCode.trim()}
                        >
                            Submit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default TPSQRScanner