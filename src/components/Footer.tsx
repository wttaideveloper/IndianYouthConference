import { Link } from 'react-router-dom'
import { Mail, Facebook, Youtube, ArrowRight, MapPin, Phone } from 'lucide-react'
import { EVENT, SOCIAL, NAV_LINKS } from '../data/content'
import Button from './Button'

export default function Footer() {
  const policyColumns = [
    [
      { label: 'Terms & Conditions', path: '/terms-and-conditions' },
      { label: 'Privacy Policy', path: '/privacy-policy' },
      { label: 'Refund Policy', path: '/refund-policy' },
      { label: 'Cancellation Policy', path: '/cancellation-policy' },
    ],
    [
      { label: 'Digital Delivery Policy', path: '/digital-delivery-policy' },
      { label: 'Cookie Policy', path: '/cookie-policy' },
      { label: 'Code of Conduct', path: '/code-of-conduct' },
      { label: 'Photography & Media Consent', path: '/photography-media-consent' },
    ],
  ]

  return (
    <footer className="relative section-dark overflow-hidden">
      <div className="orb orb-pink w-96 h-96 -bottom-48 -left-48 opacity-20" />
      <div className="orb orb-orange w-72 h-72 -top-32 right-0 opacity-15" />

      {/* CTA Banner */}
      <div className="relative border-b border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="glass-card-dark rounded-3xl p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-8">
            <div>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
                Ready to join{' '}
                <span
                  style={{
                    background: 'linear-gradient(135deg,#ffc107,#ff8a01)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                  }}
                >
                  IYC {EVENT.year}?
                </span>
              </h2>
              <p className="text-white/60 max-w-md">
                {EVENT.dates} · {EVENT.venue}
              </p>
            </div>
            <Button to="/register" variant="secondary" size="lg">
              Register Now
              <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <img src="/images/iyc-logo.png" alt="IYC" className="h-12 w-auto brightness-0 invert opacity-90" />
              <div>
                <span className="font-display font-bold text-white text-lg block">IYC</span>
                <span className="text-white/40 text-xs tracking-widest uppercase">Indian Youth Conference</span>
              </div>
            </div>
            <p className="text-white/55 leading-relaxed max-w-sm text-sm">
              A self-supported ministry run by Adventist youngsters in India, helping youth grow in
              Christ and take active participation in the Lord&apos;s work.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Quick Links</h3>
            <ul className="space-y-3">
              {NAV_LINKS.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-0 group-hover:w-3 h-px bg-primary transition-all duration-200" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Policies</h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-x-4 sm:gap-y-3 lg:grid-cols-2">
              {policyColumns.map((column, index) => (
                <ul key={index} className="space-y-3">
                  {column.map((link) => (
                    <li key={link.path}>
                      <Link
                        to={link.path}
                        className="text-white/50 hover:text-white text-sm transition-colors flex items-center gap-2 group rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary focus-visible:text-white"
                      >
                        <span className="w-0 group-hover:w-3 h-px bg-primary transition-all duration-200" />
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-5 text-sm uppercase tracking-widest">Connect</h3>
            <div className="space-y-4">
              <a
                href={`mailto:${EVENT.email}`}
                className="flex items-center gap-3 text-white/50 hover:text-white text-sm transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center">
                  <Mail size={14} className="text-primary" />
                </div>
                {EVENT.email}
              </a>
              <a
                href={`tel:${EVENT.supportPhone.replace(/\s/g, '')}`}
                className="flex items-center gap-3 text-white/50 hover:text-white text-sm transition-colors"
              >
                <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center">
                  <Phone size={14} className="text-secondary" />
                </div>
                {EVENT.supportPhone}
              </a>
              <div className="flex items-start gap-3 text-white/50 text-sm">
                <div className="w-8 h-8 rounded-lg bg-white/8 flex items-center justify-center shrink-0">
                  <MapPin size={14} className="text-accent" />
                </div>
                <span>{EVENT.venue}</span>
              </div>
              <div className="flex gap-3 pt-2">
                <a
                  href={SOCIAL.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-primary/30 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href={SOCIAL.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-9 h-9 rounded-xl bg-white/8 hover:bg-primary/30 flex items-center justify-center text-white/60 hover:text-white transition-all"
                >
                  <Youtube size={16} />
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/35">
          <p>&copy; {new Date().getFullYear()} Indian Youth Conference. All rights reserved.</p>
          <p>
            Crafted by{' '}
            <a
              href="https://wisdomtooth.tech"
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/50 hover:text-white transition-colors"
            >
              Wisdom Tooth Technologies
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
