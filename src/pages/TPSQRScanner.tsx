import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { BrowserQRCodeReader } from '@zxing/library'
import { useAdminAuth } from '../hooks/useAdminAuth'
import { useTPSPanelStore } from '../hooks/useTPSPanelStore'
import { createTpsCheckin } from '../services/tpsPanel'
import '../styles/TPSPanel.css'

const TPSQRScanner = (): JSX.Element => {
    const navigate = useNavigate()
    const { token } = useAdminAuth()
    const [searchParams] = useSearchParams()
    const tpsIdParam = searchParams.get('tpsId') ?? undefined
    const { panelInfo, addQueueEntry } = useTPSPanelStore()

    const videoRef = useRef<HTMLVideoElement>(null)
    const restartRef = useRef<() => Promise<void>>()
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [manualCode, setManualCode] = useState('')

    const stopScanning = useCallback(() => {
        setIsScanning(false)
        if (videoRef.current && videoRef.current.srcObject) {
            const stream = videoRef.current.srcObject as MediaStream
            stream.getTracks().forEach(track => track.stop())
        }
    }, [])

    const mapError = (message: string) => {
        const upper = message.toUpperCase()
        if (upper.includes('INVALID_REGISTRATION_QR')) return 'QR tidak valid untuk TPS ini.'
        if (upper.includes('NOT_TPS_VOTER')) return 'Pemilih tidak dialokasikan ke TPS ini.'
        if (upper.includes('ALREADY_VOTED')) return 'Pemilih sudah memberikan suara.'
        if (upper.includes('CHECKIN_EXISTS')) return 'Pemilih sudah check-in.'
        if (upper.includes('TPS_MISMATCH')) return 'QR tidak sesuai TPS.'
        return message
    }

    const handleCheckin = useCallback(
        async (payload: { qr_payload?: string; registration_code?: string }) => {
            if (!token || !tpsIdParam) {
                setError('Token admin atau TPS tidak ditemukan.')
                return
            }
            try {
                const entry = await createTpsCheckin(token, tpsIdParam, payload)
                addQueueEntry({
                    nim: entry.nim,
                    nama: entry.nama,
                    fakultas: entry.fakultas,
                    prodi: entry.prodi,
                    angkatan: entry.angkatan,
                    statusMahasiswa: entry.statusMahasiswa,
                    mode: entry.mode,
                })
                navigate('/tps-panel/checkin-success')
            } catch (err: any) {
                const msg = mapError((err?.message as string) ?? 'Gagal melakukan check-in.')
                setError(msg)
                setTimeout(() => void restartRef.current?.(), 3000)
            }
        },
        [addQueueEntry, navigate, tpsIdParam, token],
    )

    const handleQRCode = useCallback(async (qrPayload?: string) => {
        try {
            stopScanning()
            if (!qrPayload) {
                setError('QR code tidak terbaca. Coba ulangi.')
                setTimeout(() => void restartRef.current?.(), 2000)
                return
            }
            await handleCheckin({ qr_payload: qrPayload })
        } catch (err) {
            console.error('Check-in error:', err)
            setError('Gagal melakukan check-in. Silakan coba lagi.')
            setTimeout(() => void restartRef.current?.(), 3000)
        }
    }, [handleCheckin, stopScanning])

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
        await handleCheckin({ registration_code: manualCode.trim() })
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
