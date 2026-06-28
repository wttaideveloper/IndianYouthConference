import { motion } from 'framer-motion'

interface SectionHeadingProps {
  label: string
  title: string
  subtitle?: string
  light?: boolean
  align?: 'left' | 'center'
}

export default function SectionHeading({
  label,
  title,
  subtitle,
  light = false,
  align = 'center',
}: SectionHeadingProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`mb-14 ${align === 'center' ? 'text-center' : 'text-left'}`}
    >
      <span className={`label-pill mb-5 ${light ? 'label-pill-light' : ''}`}>
        <span className={`w-1.5 h-1.5 rounded-full ${light ? 'bg-accent' : 'bg-primary'} animate-pulse`} />
        {label}
      </span>
      <h2
        className={`font-display text-4xl md:text-5xl lg:text-[3.25rem] font-bold leading-[1.1] tracking-tight ${
          light ? 'text-white' : 'text-navy'
        }`}
      >
        {light ? title : <span className="gradient-text">{title}</span>}
      </h2>
      {subtitle && (
        <p
          className={`mt-5 text-base md:text-lg leading-relaxed max-w-2xl ${
            align === 'center' ? 'mx-auto' : ''
          } ${light ? 'text-white/65' : 'text-gray-500'}`}
        >
          {subtitle}
        </p>
      )}
      <div
        className={`mt-6 h-1 w-16 rounded-full bg-gradient-to-r from-primary to-secondary ${
          align === 'center' ? 'mx-auto' : ''
        }`}
      />
    </motion.div>
  )
}
