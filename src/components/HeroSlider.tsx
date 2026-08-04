import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, MapPin, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import { HERO_SLIDES, EVENT } from '../data/content'
import Button from './Button'
import RegistrationAccessModal from './RegistrationAccessModal'

export default function HeroSlider() {
  const [current, setCurrent] = useState(0)
  const [isRegistrationAccessOpen, setIsRegistrationAccessOpen] = useState(false)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % HERO_SLIDES.length)
  }, [])

  const prev = () => {
    setCurrent((p) => (p - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)
  }

  useEffect(() => {
    const timer = setInterval(next, 7000)
    return () => clearInterval(timer)
  }, [next])

  const slide = HERO_SLIDES[current]

  return (
    <section className="relative h-screen min-h-[680px] max-h-[920px] overflow-hidden bg-navy">
      {/* Background slides */}
      <AnimatePresence mode="sync">
        <motion.div
          key={current}
          initial={{ opacity: 0, scale: 1.08 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${slide.image})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-navy/90 via-navy/70 to-primary/50" />
          <div className="absolute inset-0 bg-gradient-to-t from-navy via-transparent to-navy/30" />
        </motion.div>
      </AnimatePresence>

      {/* Floating orbs */}
      <div className="orb orb-pink w-96 h-96 -top-20 -right-20 opacity-60" />
      <div className="orb orb-orange w-72 h-72 bottom-20 -left-20 opacity-50" />
      <div className="orb orb-gold w-48 h-48 top-1/2 right-1/4 opacity-40" />

      {/* Grid overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
          backgroundSize: '60px 60px',
        }}
      />

      {/* Content */}
      <div className="relative h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col justify-center pt-24">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-3xl"
          >
            <motion.span
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="label-pill label-pill-light mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              {slide.title}
            </motion.span>

            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
              Indian Youth Conference{' '}
              <span
                style={{
                  background: 'linear-gradient(135deg, #ffc107, #ff8a01, #e1137b)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                {EVENT.year}
              </span>
            </h1>

            <div className="flex flex-wrap gap-3 mb-10">
              <div className="glass-card-dark flex items-center gap-2.5 px-4 py-2.5 rounded-full text-white/90 text-sm">
                <Calendar size={16} className="text-accent shrink-0" />
                {slide.dates}
              </div>
              <div className="glass-card-dark flex items-center gap-2.5 px-4 py-2.5 rounded-full text-white/90 text-sm">
                <MapPin size={16} className="text-secondary shrink-0" />
                {slide.venue}
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button to="/register" variant="secondary" size="lg">
                Register Now
                <ArrowRight size={18} />
              </Button>
              <Button
                variant="glass"
                size="lg"
                onClick={() => setIsRegistrationAccessOpen(true)}
                className="!border-primary/60 !bg-navy/70 hover:!border-secondary/70 hover:!bg-primary/20"
              >
                Already Registered?
              </Button>
              <Button to="/about" variant="glass" size="lg">
                Learn More
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide counter */}
        <div className="absolute bottom-28 right-4 sm:right-8 hidden md:flex items-end gap-1 font-display">
          <span className="text-5xl font-bold text-white leading-none">
            {String(current + 1).padStart(2, '0')}
          </span>
          <span className="text-white/30 text-lg mb-1">/ {String(HERO_SLIDES.length).padStart(2, '0')}</span>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <button
          onClick={prev}
          className="p-3 rounded-full glass-card-dark text-white hover:bg-white/20 transition-all hidden md:flex"
          aria-label="Previous slide"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${
                i === current ? 'w-10 bg-gradient-to-r from-primary to-secondary' : 'w-1.5 bg-white/30 hover:bg-white/50'
              }`}
              aria-label={`Go to slide ${i + 1}`}
            />
          ))}
        </div>
        <button
          onClick={next}
          className="p-3 rounded-full glass-card-dark text-white hover:bg-white/20 transition-all hidden md:flex"
          aria-label="Next slide"
        >
          <ChevronRight size={20} />
        </button>
      </div>

      {/* Ticker strip */}
      <div className="absolute bottom-0 left-0 right-0 bg-navy/60 backdrop-blur-sm border-t border-white/5 py-3 overflow-hidden">
        <div className="animate-ticker flex whitespace-nowrap gap-12">
          {[...Array(2)].map((_, gi) => (
            <div key={gi} className="flex gap-12 items-center">
              {[
                EVENT.dates,
                EVENT.venue,
                'Sealed For A Purpose',
                'Register Now — Limited Seats',
                EVENT.tagline,
              ].map((text) => (
                <span key={`${gi}-${text}`} className="text-white/40 text-xs font-medium tracking-widest uppercase flex items-center gap-12">
                  {text}
                  <span className="w-1 h-1 rounded-full bg-primary/60" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
      <RegistrationAccessModal
        isOpen={isRegistrationAccessOpen}
        onClose={() => setIsRegistrationAccessOpen(false)}
      />
    </section>
  )
}
