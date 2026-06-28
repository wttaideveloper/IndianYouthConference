import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface PageHeroProps {
  title: string
  subtitle?: string
  background?: string
}

export default function PageHero({ title, subtitle, background }: PageHeroProps) {
  return (
    <section className="relative pt-36 pb-24 overflow-hidden bg-navy min-h-[340px] flex items-end">
      {background && (
        <div
          className="absolute inset-0 bg-cover bg-center scale-105"
          style={{ backgroundImage: `url(${background})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-br from-navy/95 via-navy/80 to-primary/60" />
      <div className="orb orb-pink w-80 h-80 -top-10 right-0 opacity-40" />
      <div className="orb orb-orange w-60 h-60 bottom-0 left-10 opacity-30" />

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.8) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }}
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        {subtitle && (
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="label-pill label-pill-light mb-5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            {subtitle}
          </motion.span>
        )}
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6 }}
          className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6"
        >
          {title}
        </motion.h1>
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="flex items-center gap-2 text-white/50 text-sm"
          aria-label="Breadcrumb"
        >
          <Link to="/" className="hover:text-white transition-colors duration-200">
            Home
          </Link>
          <ChevronRight size={14} className="text-white/30" />
          <span className="text-white/90 font-medium">{title}</span>
        </motion.nav>
      </div>
    </section>
  )
}
