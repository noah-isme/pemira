import { createContext, useContext, useState } from 'react'
import type { ReactNode } from 'react'
import '../styles/Popup.css'

export interface PopupOptions {
    title?: string
    message: string
    type?: 'info' | 'warning' | 'error' | 'success'
    confirmText?: string
    cancelText?: string
    showCancel?: boolean
    onConfirm?: () => void
    onCancel?: () => void
}

interface PopupContextType {
    showPopup: (options: PopupOptions) => Promise<boolean>
    hidePopup: () => void
}

const PopupContext = createContext<PopupContextType | undefined>(undefined)

export const usePopup = () => {
    const context = useContext(PopupContext)
    if (!context) {
        throw new Error('usePopup must be used within a PopupProvider')
    }
    return context
}

interface PopupProviderProps {
    children: ReactNode
}

export const PopupProvider = ({ children }: PopupProviderProps) => {
    const [popup, setPopup] = useState<PopupOptions | null>(null)
    const [resolvePromise, setResolvePromise] = useState<((value: boolean) => void) | null>(null)

    const showPopup = (options: PopupOptions): Promise<boolean> => {
        return new Promise((resolve) => {
            setPopup(options)
            setResolvePromise(() => resolve)
        })
    }

    const hidePopup = () => {
        setPopup(null)
        if (resolvePromise) {
            resolvePromise(false)
            setResolvePromise(null)
        }
    }

    const handleConfirm = () => {
        if (popup?.onConfirm) {
            popup.onConfirm()
        }
        setPopup(null)
        if (resolvePromise) {
            resolvePromise(true)
            setResolvePromise(null)
        }
    }

    const handleCancel = () => {
        if (popup?.onCancel) {
            popup.onCancel()
        }
        setPopup(null)
        if (resolvePromise) {
            resolvePromise(false)
            setResolvePromise(null)
        }
    }

    return (
        <PopupContext.Provider value={{ showPopup, hidePopup }}>
            {children}
            {popup && (
                <PopupModal
                    popup={popup}
                    onConfirm={handleConfirm}
                    onCancel={handleCancel}
                    onClose={hidePopup}
                />
            )}
        </PopupContext.Provider>
    )
}

interface PopupModalProps {
    popup: PopupOptions
    onConfirm: () => void
    onCancel: () => void
    onClose: () => void
}

const PopupModal = ({ popup, onConfirm, onCancel, onClose }: PopupModalProps) => {
    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose()
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose()
        } else if (e.key === 'Enter') {
            onConfirm()
        }
    }

    return (
        <div className="popup-overlay" onClick={handleBackdropClick} onKeyDown={handleKeyDown} tabIndex={-1}>
            <div className="popup-modal">
                <div className="popup-header">
                    {popup.title && <h3 className="popup-title">{popup.title}</h3>}
                    <button className="popup-close" onClick={onClose} aria-label="Close">
                        ×
                    </button>
                </div>
                <div className="popup-body">
                    <div className={`popup-icon popup-icon-${popup.type || 'info'}`}>
                        {getIcon(popup.type || 'info')}
                    </div>
                    <p className="popup-message">{popup.message}</p>
                </div>
                <div className="popup-footer">
                    {popup.showCancel !== false && (
                        <button className="popup-btn popup-btn-secondary" onClick={onCancel}>
                            {popup.cancelText || 'Batal'}
                        </button>
                    )}
                    <button className="popup-btn popup-btn-primary" onClick={onConfirm} autoFocus>
                        {popup.confirmText || 'OK'}
                    </button>
                </div>
            </div>
        </div>
    )
}

const getIcon = (type: string) => {
    switch (type) {
        case 'success':
            return '✓'
        case 'error':
            return '✕'
        case 'warning':
            return '⚠'
        case 'info':
        default:
            return 'ℹ'
    }
}