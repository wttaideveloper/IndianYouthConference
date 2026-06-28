import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Users, Target, Heart, ArrowRight, Star, Clock } from 'lucide-react'
import HeroSlider from '../components/HeroSlider'
import Countdown from '../components/Countdown'
import SectionHeading from '../components/SectionHeading'
import Button from '../components/Button'
import {
  EVENT,
  FEATURES,
  SPEAKERS,
  SCHEDULE_DAYS,
  PRICING_TIERS,
  DONATION,
} from '../data/content'

const ICONS = [Users, Target, Heart]
const ICON_COLORS = ['from-primary/20 to-primary/5', 'from-secondary/20 to-secondary/5', 'from-accent/20 to-accent/5']

export default function Home() {
  const [activeDay, setActiveDay] = useState(0)

  return (
    <>
      <HeroSlider />
      <Countdown />

      {/* Features — Bento grid */}
      <section className="py-24 md:py-32 section-mesh">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Indian Youth Conference" title="Who We Are" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {FEATURES.slice(0, 3).map((feature, i) => {
              const Icon = ICONS[i]
              return (
                <motion.div
                  key={feature.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.12, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                  className={`card-hover glass-card rounded-3xl p-8 ${i === 1 ? 'md:-translate-y-4' : ''}`}
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${ICON_COLORS[i]} flex items-center justify-center mb-6`}>
                    <Icon className="text-primary" size={26} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl font-bold text-navy mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed text-sm mb-6">{feature.description}</p>
                  <Button to="/about" variant="ghost" className="!px-0 !py-0 gap-1.5 text-sm">
                    Explore <ArrowRight size={15} />
                  </Button>
                </motion.div>
              )
            })}
          </div>
        </div>
      </section>

      {/* About IYC 2026 */}
      <section className="py-24 md:py-32 section-dark relative overflow-hidden">
        <div className="orb orb-pink w-[500px] h-[500px] top-0 right-0 opacity-20" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <span className="label-pill label-pill-light mb-6">Indian Youth Conference</span>
              <h2 className="font-display text-5xl md:text-6xl font-bold text-white leading-tight mb-4">
                IYC{' '}
                <span style={{ background: 'linear-gradient(135deg,#ffc107,#ff8a01)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  {EVENT.year}
                </span>
              </h2>
              <div className="inline-flex items-center gap-2 bg-primary/20 border border-primary/30 rounded-full px-4 py-1.5 mb-6">
                <Star size={14} className="text-accent" />
                <span className="text-accent text-sm font-semibold">Early Bird Registration Opening Soon</span>
              </div>
              <p className="text-white/65 leading-relaxed mb-8 text-base">
                Embark on a transformative journey combining insightful discussions, networking
                opportunities, and a chance to be part of a global youth community. IYC {EVENT.year} is just
                around the corner.
              </p>
              <Button to="/register" variant="secondary" size="lg">
                Register Now <ArrowRight size={18} />
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="relative"
            >
              <div className="absolute -inset-4 bg-gradient-to-br from-primary/30 to-secondary/20 rounded-3xl blur-2xl" />
              <div className="relative img-frame">
                <img
                  src="/images/resource/home-camp-big.jpg"
                  alt="IYC Camp"
                  className="w-full object-cover aspect-[4/3] rounded-3xl"
                  onError={(e) => {
                    const el = e.target as HTMLImageElement
                    el.src = 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450"><rect fill="%230d1030" width="600" height="450"/><text x="50%" y="50%" fill="%23e1137b" font-size="24" text-anchor="middle" dy=".3em" font-family="sans-serif">IYC ${EVENT.year}</text></svg>`)
                  }}
                />
              </div>
              <div className="absolute -bottom-5 -left-5 glass-card rounded-2xl px-5 py-4 shadow-xl">
                <p className="font-display text-2xl font-bold text-navy">5 Days</p>
                <p className="text-gray-400 text-xs">of worship & ministry</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Speakers */}
      <section className="py-24 md:py-32 section-mesh bg-white/50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Who are Speaking" title="Presenters" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
            {SPEAKERS.map((speaker, i) => (
              <motion.div
                key={speaker.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
                className="group"
              >
                <div className="relative img-frame mb-4 aspect-[3/4] card-hover">
                  <img
                    src={speaker.image}
                    alt={speaker.name}
                    className="w-full h-full object-cover rounded-2xl"
                    onError={(e) => {
                      const el = e.target as HTMLImageElement
                      el.src = `data:image/svg+xml,${encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="200" height="280"><rect fill="%23e1137b15" width="200" height="280"/><text x="50%" y="50%" fill="%23060818" font-size="14" text-anchor="middle" dy=".3em" font-family="sans-serif">${speaker.name.split(' ')[0]}</text></svg>`)}`
                    }}
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-navy/90 via-navy/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-400 flex flex-col justify-end p-4">
                    <span className="text-white font-semibold text-sm">{speaker.name}</span>
                    <span className="text-white/50 text-xs">Presenter</span>
                  </div>
                  <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg">
                    <Star size={14} className="text-primary fill-primary" />
                  </div>
                </div>
                <h4 className="font-semibold text-navy text-sm text-center">{speaker.name}</h4>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Schedule */}
      <section className="py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Indian Youth Conference" title="Conference Schedule" />

          <div className="flex gap-2 overflow-x-auto pb-4 mb-10 scrollbar-none">
            {SCHEDULE_DAYS.map((day, i) => (
              <button
                key={day.day}
                onClick={() => setActiveDay(i)}
                className={`shrink-0 px-6 py-4 rounded-2xl font-medium transition-all duration-300 ${
                  activeDay === i
                    ? 'bg-gradient-to-br from-primary to-secondary text-white shadow-xl shadow-primary/25 scale-105'
                    : 'glass-card text-gray-600 hover:shadow-md'
                }`}
              >
                <span className="block font-display text-2xl font-bold leading-none mb-1">
                  {String(day.day).padStart(2, '0')}
                </span>
                <span className="text-xs opacity-80 block">{day.weekday}</span>
                <span className="text-[10px] opacity-60 mt-0.5 block">Oct {EVENT.year}</span>
              </button>
            ))}
          </div>

          <div className="max-w-2xl mx-auto space-y-3">
            {SPEAKERS.map((speaker, i) => (
              <motion.div
                key={speaker.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.06 }}
                className="glass-card rounded-2xl p-4 flex items-center gap-4 card-hover"
              >
                <div className="relative shrink-0">
                  <img
                    src={speaker.image}
                    alt={speaker.name}
                    className="w-14 h-14 rounded-xl object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                    <Clock size={10} className="text-navy" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-primary font-semibold uppercase tracking-wider mb-0.5">TBA</p>
                  <h4 className="font-semibold text-navy text-sm">To be announced soon</h4>
                  <p className="text-gray-400 text-xs">{speaker.name}</p>
                </div>
              </motion.div>
            ))}
            <p className="text-center text-gray-400 text-xs mt-6">
              Full schedule for <strong className="text-navy">{SCHEDULE_DAYS[activeDay].date}</strong> coming soon
            </p>
          </div>
        </div>
      </section>

      {/* Donation & Payment QR */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-primary" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} />
        <div className="relative max-w-4xl mx-auto px-4 text-center">
          <p className="text-white/90 text-lg md:text-xl leading-relaxed mb-10 font-light italic">
            &ldquo;Your support through a donation would make a meaningful difference and help us
            continue our mission; any amount is greatly appreciated!&rdquo;
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="glass-card-dark rounded-3xl p-8 flex flex-col items-center">
              <p className="font-display font-bold text-white text-center mb-5">Scan & Pay</p>
              <div className="bg-white p-4 rounded-2xl inline-flex">
                <img
                  src={DONATION.qrCode}
                  alt="IYC Payment QR Code — boim-855030150369@boi"
                  className="block w-[min(100%,280px)] h-auto object-contain"
                />
              </div>
            </div>
            <div className="glass-card-dark rounded-3xl p-8 md:p-10">
              <p className="font-display font-bold text-white text-center mb-6">Donate via Bank Transfer</p>
              <div className="space-y-3">
                {[
                  ['Account Name', DONATION.accountName],
                  ['Account No.', DONATION.accountNo],
                  ['Bank', DONATION.bank],
                  ['IFSC', DONATION.ifsc],
                  ['MICR', DONATION.micr],
                  ...(DONATION.upiId ? [['UPI ID', DONATION.upiId] as const] : []),
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between items-center py-2 border-b border-white/8 last:border-0">
                    <span className="text-white/50 text-sm">{label}</span>
                    <span className="text-white font-medium text-sm font-mono">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-24 md:py-32 section-mesh">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading label="Indian Youth Conference" title="Registration Fees" />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {PRICING_TIERS.map((tier, i) => (
              <motion.div
                key={tier.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className={`relative rounded-3xl overflow-hidden card-hover ${
                  tier.highlighted ? 'border-gradient glow-primary' : 'glass-card'
                }`}
              >
                {tier.highlighted && (
                  <div className="absolute top-4 right-4 z-10 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full">
                    Popular
                  </div>
                )}
                <div className={`p-6 ${tier.highlighted ? 'bg-gradient-to-br from-primary to-primary-dark' : 'bg-navy'}`}>
                  <h3 className="font-display text-xl font-bold text-white">{tier.title}</h3>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-white/60 text-lg">₹</span>
                    <span className="font-display text-5xl font-bold text-white">{tier.price}</span>
                  </div>
                </div>
                <div className="p-6 bg-white">
                  <p className="text-gray-500 text-sm mb-6">{tier.description}</p>
                  <ul className="space-y-2.5 mb-8">
                    {tier.features.map((f) => (
                      <li key={f.text} className="flex items-center gap-3 text-sm">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${f.included ? 'bg-green-50' : 'bg-red-50'}`}>
                          {f.included ? (
                            <Check size={12} className="text-green-500" />
                          ) : (
                            <X size={12} className="text-red-400" />
                          )}
                        </div>
                        <span className={f.included ? 'text-gray-700' : 'text-gray-400 line-through decoration-gray-300'}>
                          {f.text}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Button to="/register" variant={tier.highlighted ? 'primary' : 'outline'} className="w-full">
                    Register Now
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
