import { useMemo } from 'react'
import { BRANDING_STORAGE_KEY, initialBranding } from '../../data/electionSettings'
import '../../styles/shared/PemiraLogos.css'

type LogoSize = 'sm' | 'md' | 'lg'

type PemiraLogosProps = {
  size?: LogoSize
  title?: string
  subtitle?: string
  showText?: boolean
  stacked?: boolean
  className?: string
  variant?: 'dual' | 'kpu'
  customLogos?: string[]
}

const PemiraLogos = ({
  size = 'md',
  title = 'PEMIRA UNIWA',
  subtitle,
  showText = true,
  stacked = false,
  className,
  variant = 'dual',
  customLogos,
}: PemiraLogosProps): JSX.Element => {
  const classes = ['pemira-logos', `pemira-logos-${size}`]
  if (stacked) classes.push('stacked')
  if (className) classes.push(className)

  const storedLogos = useMemo(() => {
    if (typeof window === 'undefined') return undefined
    const raw = window.localStorage.getItem(BRANDING_STORAGE_KEY)
    if (!raw) return undefined
    try {
      const parsed = JSON.parse(raw) as { primaryLogo?: string; secondaryLogo?: string }
      const available = [parsed.primaryLogo, parsed.secondaryLogo].filter(Boolean) as string[]
      return available.length > 0 ? available : undefined
    } catch {
      return undefined
    }
  }, [])

  const defaultLogos =
    variant === 'kpu'
      ? [initialBranding.primaryLogo ?? '/images/logo kpu.png']
      : [initialBranding.primaryLogo ?? '/images/logo kpu.png', initialBranding.secondaryLogo ?? '/images/Logo UNIWA.png']

  const provided = (customLogos ?? storedLogos)?.filter(Boolean)
  const badges =
    provided && provided.length > 0
      ? variant === 'kpu'
        ? [provided[0] ?? defaultLogos[0]]
        : [provided[0] ?? defaultLogos[0], provided[1] ?? provided[0] ?? defaultLogos[1]]
      : defaultLogos

  return (
    <div className={classes.join(' ')}>
      <div className="logo-badges">
        {badges.map((src) => (
          <div key={src} className="logo-badge">
            <img src={src} alt="Logo" loading="lazy" />
          </div>
        ))}
      </div>

      {showText && (
        <div className="logo-text-block">
          <span className="logo-title">{title}</span>
          {subtitle && <span className="logo-subtitle">{subtitle}</span>}
        </div>
      )}
    </div>
  )
}

export default PemiraLogos
