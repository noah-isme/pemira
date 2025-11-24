import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { panitiaProfile, tpsPanelInfo, tpsStaticQRInfo } from '../data/tpsPanel'
import { approveTpsCheckin, fetchTpsPanelQueue, fetchTpsPanelSummary, rejectTpsCheckin } from '../services/tpsPanel'
import type {
  TPSActivityLog,
  TPSHistoryRecord,
  TPSPanelInfo,
  TPSPanitiaProfile,
  TPSPanelNotification,
  TPSQueueEntry,
  TPSQueueFeedPayload,
  TPSQueueStatus,
  TPSStaticQRInfo,
  TPSVotingMode,
} from '../types/tpsPanel'

type QueueSnapshotEntry = Omit<TPSQueueEntry, 'token' | 'verifiedAt'> & {
  id?: string
  token?: string
  verifiedAt?: string
}

type QueueSnapshotResponse = {
  panel?: Partial<Pick<TPSPanelInfo, 'status' | 'totalVoters'>>
  queue: QueueSnapshotEntry[]
}

const QR_ROTATION_INTERVAL = 30
const MAX_QUEUE_ENTRIES = 200

const generateId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8)}`

const createToken = () => {
  const chunk = Math.random().toString(16).slice(2, 10)
  return `tps_1_${chunk}`
}

type UpdateQueueOptions = {
  reason?: string
  notify?: boolean
}

type TPSPanelContextValue = {
  panelInfo: TPSPanelInfo
  panitia: TPSPanitiaProfile
  staticQr: TPSStaticQRInfo
  queue: TPSQueueEntry[]
  logs: TPSActivityLog[]
  historyRecords: TPSHistoryRecord[]
  qrToken: string
  tokenExpiresIn: number
  panelMode: TPSVotingMode
  notification: TPSPanelNotification | null
  refreshQrToken: () => void
  setPanelStatus: (status: string) => void
  triggerManualRefresh: () => void
  updateQueueStatus: (entryId: string, status: TPSQueueStatus, options?: UpdateQueueOptions) => void
  addQueueEntry: (entry: Omit<TPSQueueEntry, 'id' | 'status' | 'token' | 'waktuScan'>) => void
  removeFromQueue: (entryId: string) => void
  dismissNotification: () => void
  setPanelMode: (mode: TPSVotingMode) => void
  syncFromApi: (token: string, tpsId: string) => Promise<void>
  approveCheckinApi: (token: string, tpsId: string, checkinId: string) => Promise<void>
  rejectCheckinApi: (token: string, tpsId: string, checkinId: string, reason?: string) => Promise<void>
  checkInVoter: () => Promise<boolean>
}

const TPSPanelContext = createContext<TPSPanelContextValue | undefined>(undefined)

export const TPSPanelProvider = ({ children }: { children: ReactNode }) => {
  const [panelInfo, setPanelInfo] = useState<TPSPanelInfo>(tpsPanelInfo)
  const [queue, setQueue] = useState<TPSQueueEntry[]>([])
  const [logs, setLogs] = useState<TPSActivityLog[]>([])
  const [historyRecords, setHistoryRecords] = useState<TPSHistoryRecord[]>([])
  const [qrToken, setQrToken] = useState<string>(createToken)
  const [tokenExpiresIn, setTokenExpiresIn] = useState<number>(QR_ROTATION_INTERVAL)
  const [notification, setNotification] = useState<TPSPanelNotification | null>(null)
  const [panelMode, setPanelMode] = useState<TPSVotingMode>('mobile')

  const feedRef = useRef<TPSQueueFeedPayload[]>([])

  const pushLog = useCallback((message: string) => {
    setLogs((prev) => {
      const entry: TPSActivityLog = {
        id: generateId('log'),
        timestamp: new Date().toISOString(),
        message,
      }
      const next = [entry, ...prev]
      return next.slice(0, 20)
    })
  }, [])

  const showNotification = useCallback((payload: Omit<TPSPanelNotification, 'id'>) => {
    setNotification({ ...payload, id: generateId('notif') })
  }, [])

  const pushHistory = useCallback((record: Omit<TPSHistoryRecord, 'id' | 'timestamp'>) => {
    setHistoryRecords((prev) => {
      const entry: TPSHistoryRecord = {
        ...record,
        id: generateId('history'),
        timestamp: new Date().toISOString(),
      }
      const next = [entry, ...prev]
      return next.slice(0, 100)
    })
  }, [])

  const capQueueSize = useCallback((items: TPSQueueEntry[]) => {
    const waiting = items.filter((item) => item.status === 'waiting')
    const others = items.filter((item) => item.status !== 'waiting')
    const allowedOthers = Math.max(0, MAX_QUEUE_ENTRIES - waiting.length)
    return [...waiting, ...others.slice(0, allowedOthers)]
  }, [])

  const setPanelStatus = useCallback(
    (status: string) => {
      setPanelInfo((prevInfo) => ({ ...prevInfo, status }))
      const isOpening = status === 'Aktif'
      const activityLabel = isOpening ? 'TPS dibuka' : 'TPS ditutup'
      pushLog(`${activityLabel} oleh ${panitiaProfile.nama}`)
      pushHistory({
        type: isOpening ? 'open' : 'close',
        nama: `Panitia: ${panitiaProfile.nama}`,
        detail: `${activityLabel} (${panelInfo.tpsName})`,
      })
    },
    [panelInfo.tpsName, pushHistory, pushLog],
  )

  const rotateQrToken = useCallback((source: 'auto' | 'manual' = 'auto') => {
    setQrToken(createToken())
    setTokenExpiresIn(QR_ROTATION_INTERVAL)
    const label = source === 'manual' ? 'QR diperbarui manual oleh panitia' : 'QR baru dibuat otomatis'
    pushLog(label)
    pushHistory({ type: 'qr', detail: label })
    showNotification({
      type: 'info',
      title: 'Token QR diperbarui',
      message: source === 'manual' ? 'Token baru siap dipindai oleh pemilih.' : 'Token berganti otomatis untuk keamanan.',
    })
  }, [pushHistory, pushLog, showNotification])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTokenExpiresIn((prev) => {
        if (prev <= 1) {
          rotateQrToken('auto')
          return QR_ROTATION_INTERVAL
        }
        return prev - 1
      })
    }, 1000)

    return () => window.clearInterval(interval)
  }, [rotateQrToken])

  const addQueueEntry = useCallback(
    (entry: Omit<TPSQueueEntry, 'id' | 'status' | 'checkInToken' | 'waktuCheckIn'>) => {
      const payload: TPSQueueEntry = {
        ...entry,
        id: generateId('queue'),
        status: 'CHECKED_IN',
        checkInToken: createToken(),
        waktuCheckIn: new Date().toISOString(),
      }
      setQueue((prev) => capQueueSize([payload, ...prev]))
      pushLog(`${payload.nama} berhasil check-in`)
      pushHistory({ type: 'checkin', nim: payload.nim, nama: payload.nama, detail: 'Check-in otomatis via QR' })
    },
    [capQueueSize, pushHistory, pushLog],
  )

  const updateQueueStatus = useCallback(
    (entryId: string, status: TPSQueueStatus, options?: UpdateQueueOptions) => {
      setQueue((prev) => {
        const target = prev.find((item) => item.id === entryId)
        if (!target) return prev
        const transformed = prev.map((item) => {
          if (item.id !== entryId) return item
          return {
            ...item,
            status,
            voteTime: status === 'VOTED' ? new Date().toISOString() : item.voteTime,
            hasVoted: status === 'VOTED' ? true : item.hasVoted,
          }
        })

        const baseMessage =
          status === 'VOTED'
            ? `${target.nama} telah menyelesaikan voting`
            : `${target.nama} status diperbarui`

        pushLog(baseMessage)

        const historyPayload: Omit<TPSHistoryRecord, 'id' | 'timestamp'> = {
          type: status === 'VOTED' ? 'vote' : 'verification',
          nim: target.nim,
          nama: target.nama,
          detail: status === 'VOTED' ? 'Voting selesai' : 'Status diperbarui',
        }
        pushHistory(historyPayload)

        if (options?.notify) {
          showNotification({
            type: status === 'VOTED' ? 'success' : 'info',
            title: status === 'VOTED' ? 'Voting Selesai' : 'Status Diperbarui',
            message: baseMessage,
          })
        }

        return transformed
      })
    },
    [pushHistory, pushLog, showNotification],
  )

  const syncFromApi = useCallback(
    async (token: string, tpsId: string) => {
      try {
        const [summary, items] = await Promise.all([fetchTpsPanelSummary(token, tpsId), fetchTpsPanelQueue(token, tpsId)])
        setPanelInfo((prev) => ({
          ...prev,
          tpsName: summary.name ?? prev.tpsName,
          tpsCode: summary.code ?? prev.tpsCode,
          lokasi: summary.location ?? prev.lokasi,
          status: summary.status?.toUpperCase() === 'ACTIVE' ? 'Aktif' : summary.status ?? prev.status,
          totalVoters: summary.stats?.total_votes ?? prev.totalVoters,
        }))
        setQueue(items)
        pushLog('Queue disinkron dari API TPS')
        pushHistory({ type: 'open', detail: 'Sinkronisasi queue dari API' })
      } catch (err) {
        const status = (err as { status?: number })?.status
        if (status === 404) {
          setQueue([])
          showNotification({ title: 'TPS tidak ditemukan', message: 'Endpoint panel TPS belum tersedia atau tpsId tidak valid.', type: 'warning' })
          return
        }
        console.error('Failed to sync TPS panel from API', err)
        showNotification({ title: 'Gagal sinkron data TPS', message: 'Pastikan token admin/operator valid dan TPS ID benar.', type: 'info' })
      }
    },
    [pushHistory, pushLog, showNotification],
  )

  const approveCheckinApi = useCallback(
    async (token: string, tpsId: string, checkinId: string) => {
      await approveTpsCheckin(token, tpsId, checkinId)
      updateQueueStatus(checkinId, 'verified', { notify: true })
    },
    [updateQueueStatus],
  )

  const rejectCheckinApi = useCallback(
    async (token: string, tpsId: string, checkinId: string, reason?: string) => {
      await rejectTpsCheckin(token, tpsId, checkinId, reason)
      updateQueueStatus(checkinId, 'rejected', { notify: true, reason: reason ?? 'Ditolak' })
    },
    [updateQueueStatus],
  )
  const removeFromQueue = useCallback(
    (entryId: string) => {
      setQueue((prev) => {
        const target = prev.find((item) => item.id === entryId)
        if (!target) return prev
        pushLog(`${target.nama} dihapus dari antrean`)
        pushHistory({ type: 'rejection', nim: target.nim, nama: target.nama, detail: 'Dihapus dari antrean' })
        return prev.filter((item) => item.id !== entryId)
      })
      showNotification({
        type: 'warning',
        title: 'Antrean dihapus',
        message: 'Pemilih dihapus dari antrean oleh panitia.',
        entryId,
      })
    },
    [pushHistory, pushLog, showNotification],
  )

  const checkInVoter = useCallback(
    async (): Promise<boolean> => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      try {
        // Here we would validate the QR code and check-in the voter
        // For now, simulate the check-in process
        const mockVoterData = {
          nim: '21034567',
          nama: 'Roni Saputra',
          fakultas: 'Teknik Informatika',
          prodi: 'Teknik Informatika',
          angkatan: '2021',
          statusMahasiswa: 'Aktif',
          mode: 'mobile' as TPSVotingMode,
        }

        // Check if voter is already checked in
        const existing = queue.find((item) => item.nim === mockVoterData.nim)
        if (existing) {
          return false // Already checked in
        }

        // Add to queue as CHECKED_IN
        addQueueEntry(mockVoterData)
        return true
      } catch (error) {
        console.error('Check-in failed:', error)
        return false
      }
    },
    [queue, addQueueEntry],
  )

  const fetchQueueSnapshot = useCallback(async () => {
    setQueue((prev) => prev)
  }, [])

  useEffect(() => {
    if (!feedRef.current.length) return

    let timer: number | undefined

    const scheduleNext = () => {
      if (!feedRef.current.length) return
      const nextPayload = feedRef.current.shift()
      if (!nextPayload) return

      timer = window.setTimeout(() => {
        addQueueEntry({
          nim: nextPayload.nim,
          nama: nextPayload.nama,
          fakultas: nextPayload.fakultas,
          prodi: nextPayload.prodi,
          angkatan: nextPayload.angkatan,
          statusMahasiswa: nextPayload.statusMahasiswa,
          mode: nextPayload.mode,
        })
        scheduleNext()
      }, nextPayload.delayMs)
    }

    scheduleNext()

    return () => {
      if (timer) {
        window.clearTimeout(timer)
      }
    }
  }, [addQueueEntry])

  useEffect(() => {
    if (!notification) return
    const timer = window.setTimeout(() => setNotification(null), 5000)
    return () => window.clearTimeout(timer)
  }, [notification])

  const value = useMemo(
    () => ({
      panelInfo,
      panitia: panitiaProfile,
      staticQr: tpsStaticQRInfo,
      queue,
      logs,
      historyRecords,
      qrToken,
      tokenExpiresIn,
      notification,
      panelMode,
      refreshQrToken: () => rotateQrToken('manual'),
      setPanelStatus,
      triggerManualRefresh: () => {
        void fetchQueueSnapshot()
      },
      syncFromApi,
      approveCheckinApi,
      rejectCheckinApi,
      checkInVoter,
      updateQueueStatus,
      addQueueEntry,
      removeFromQueue,
      dismissNotification: () => setNotification(null),
      setPanelMode,
    }),
    [
      addQueueEntry,
      fetchQueueSnapshot,
      historyRecords,
      logs,
      notification,
      panelInfo,
      panelMode,
      queue,
      qrToken,
      approveCheckinApi,
      rejectCheckinApi,
      checkInVoter,
      removeFromQueue,
      rotateQrToken,
      setPanelStatus,
      syncFromApi,
      tokenExpiresIn,
      updateQueueStatus,
    ],
  )

  return <TPSPanelContext.Provider value={value}>{children}</TPSPanelContext.Provider>
}

export const useTPSPanelStore = () => {
  const context = useContext(TPSPanelContext)
  if (!context) {
    throw new Error('useTPSPanelStore must be used within TPSPanelProvider')
  }
  return context
}
