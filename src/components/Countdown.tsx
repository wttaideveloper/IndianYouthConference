import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Zap } from 'lucide-react'
import { EVENT } from '../data/content'

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
}

function calcTimeLeft(): TimeLeft {
  const diff = EVENT.countdownDate.getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 }
  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  }
}

const UNITS = [
  { key: 'days' as const, label: 'Days' },
  { key: 'hours' as const, label: 'Hours' },
  { key: 'minutes' as const, label: 'Mins' },
  { key: 'seconds' as const, label: 'Secs' },
]

function TimeBlock({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="relative glow-ring rounded-2xl">
        <div className="relative w-[72px] h-[80px] md:w-[88px] md:h-[96px] rounded-2xl bg-navy flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20" />
          <AnimatePresence mode="popLayout">
            <motion.span
              key={value}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 20, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative font-display text-3xl md:text-4xl font-bold text-white tabular-nums"
            >
              {String(value).padStart(2, '0')}
            </motion.span>
          </AnimatePresence>
        </div>
      </div>
      <span className="mt-2 block text-[10px] font-semibold text-gray-400 uppercase tracking-[0.2em]">
        {label}
      </span>
    </div>
  )
}

export default function Countdown() {
  const [time, setTime] = useState<TimeLeft>(calcTimeLeft)

  useEffect(() => {
    const timer = setInterval(() => setTime(calcTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="relative -mt-20 z-10 px-4 pb-4">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-5xl mx-auto glass-card rounded-3xl p-6 md:p-10 glow-primary"
      >
        <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
          <div className="text-center lg:text-left">
            <div className="flex items-center gap-2 justify-center lg:justify-start mb-3">
              <Zap size={16} className="text-secondary" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                Event Countdown
              </span>
            </div>
            <div className="flex items-baseline gap-2 justify-center lg:justify-start mb-3">
              <span className="font-display text-5xl md:text-6xl font-bold text-navy">16</span>
              <span className="font-display text-3xl md:text-4xl font-bold gradient-text">October</span>
              <span className="font-display text-2xl text-gray-400 font-medium">{EVENT.year}</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 justify-center lg:justify-start">
              <MapPin size={15} className="text-secondary shrink-0" />
              <span className="text-sm">{EVENT.venue}</span>
            </div>
          </div>

          <div className="flex items-center gap-3 md:gap-5">
            {UNITS.map((unit, i) => (
              <div key={unit.key} className="flex items-center gap-3 md:gap-5">
                <TimeBlock value={time[unit.key]} label={unit.label} />
                {i < UNITS.length - 1 && (
                  <span className="font-display text-2xl font-bold text-primary/40 -mt-5 hidden sm:block">:</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  )
}
