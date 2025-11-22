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
}

const PemiraLogos = ({
  size = 'md',
  title = 'PEMIRA UNIWA',
  subtitle,
  showText = true,
  stacked = false,
  className,
  variant = 'dual',
}: PemiraLogosProps): JSX.Element => {
  const classes = ['pemira-logos', `pemira-logos-${size}`]
  if (stacked) classes.push('stacked')
  if (className) classes.push(className)

  const badges = variant === 'kpu' ? ['/images/logo kpu.png'] : ['/images/logo kpu.png', '/images/Logo UNIWA.png']

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
