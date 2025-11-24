import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import '../styles/Toast.css'

export interface Toast {
    id: string
    message: string
    type: 'success' | 'error' | 'info' | 'warning'
    duration?: number
}

interface ToastContextType {
    toasts: Toast[]
    showToast: (message: string, type?: Toast['type'], duration?: number) => void
    hideToast: (id: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
    const context = useContext(ToastContext)
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider')
    }
    return context
}

interface ToastProviderProps {
    children: ReactNode
}

export const ToastProvider = ({ children }: ToastProviderProps) => {
    const [toasts, setToasts] = useState<Toast[]>([])

    const hideToast = useCallback((id: string) => {
        setToasts(prev => prev.filter(toast => toast.id !== id))
    }, [])

    const showToast = useCallback((message: string, type: Toast['type'] = 'info', duration = 5000) => {
        const id = Date.now().toString()
        const toast: Toast = { id, message, type, duration }

        setToasts(prev => [...prev, toast])

        if (duration > 0) {
            setTimeout(() => {
                hideToast(id)
            }, duration)
        }
    }, [hideToast])

    return (
        <ToastContext.Provider value={{ toasts, showToast, hideToast }}>
            {children}
            <ToastContainer />
        </ToastContext.Provider>
    )
}

const ToastContainer = () => {
    const { toasts, hideToast } = useToast()

    return (
        <div className="toast-container">
            {toasts.map(toast => (
                <ToastItem key={toast.id} toast={toast} onClose={hideToast} />
            ))}
        </div>
    )
}

interface ToastItemProps {
    toast: Toast
    onClose: (id: string) => void
}

const ToastItem = ({ toast, onClose }: ToastItemProps) => {
    const handleClose = () => {
        onClose(toast.id)
    }

    return (
        <div className={`toast toast-${toast.type}`}>
            <div className="toast-content">
                <span className="toast-message">{toast.message}</span>
                <button className="toast-close" onClick={handleClose} aria-label="Close">
                    ×
                </button>
            </div>
        </div>
    )
}