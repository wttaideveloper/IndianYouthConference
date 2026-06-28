import { Link } from 'react-router-dom'

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass'

interface ButtonProps {
  children: React.ReactNode
  variant?: ButtonVariant
  href?: string
  to?: string
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  size?: 'sm' | 'md' | 'lg'
}

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-gradient-to-r from-primary via-primary-light to-secondary text-white shadow-xl shadow-primary/30 btn-shine',
  secondary:
    'bg-gradient-to-r from-secondary to-accent text-navy font-bold shadow-xl shadow-secondary/30 btn-shine',
  outline:
    'border-2 border-primary/60 text-primary hover:bg-primary hover:text-white hover:border-primary hover:shadow-lg hover:shadow-primary/20',
  ghost: 'text-primary hover:bg-primary/8',
  glass:
    'glass-card-dark text-white border border-white/15 hover:bg-white/10 hover:border-white/25',
}

const sizes = {
  sm: 'px-4 py-2 text-xs',
  md: 'px-6 py-3 text-sm',
  lg: 'px-8 py-4 text-base',
}

export default function Button({
  children,
  variant = 'primary',
  href,
  to,
  onClick,
  className = '',
  type = 'button',
  size = 'md',
}: ButtonProps) {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]'

  const classes = `${base} ${sizes[size]} ${variants[variant]} ${className}`

  if (to) {
    return (
      <Link to={to} className={classes}>
        {children}
      </Link>
    )
  }

  if (href) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes}>
        {children}
      </a>
    )
  }

  return (
    <button type={type} onClick={onClick} className={classes}>
      {children}
    </button>
  )
}
