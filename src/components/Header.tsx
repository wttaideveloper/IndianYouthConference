import { useState, useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { Menu, X, Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { NAV_LINKS, EVENT } from '../data/content'
import Button from './Button'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const { pathname } = useLocation()
  const isHome = pathname === '/'

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [pathname])

  useEffect(() => {
    setLogoError(false)
  }, [])

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen])

  // On inner pages, always use the solid glass bar for readability
  const showBar = !isHome || scrolled

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4 md:pt-5">
        <div
          className={`max-w-7xl mx-auto transition-all duration-500 rounded-2xl ${
            showBar
              ? 'glass-card shadow-xl shadow-black/6 py-2.5 px-4 md:px-6'
              : 'py-1 px-2'
          }`}
        >
          <div className="flex items-center justify-between gap-4">
            <Link to="/" className="flex items-center gap-3 group shrink-0">
              {!logoError ? (
                <img
                  src="/images/iyc-logo.png"
                  alt="Indian Youth Conference"
                  className={`h-10 md:h-11 w-auto min-w-[40px] object-contain transition-all duration-300 group-hover:scale-105 rounded-lg ${
                    showBar ? 'invert mix-blend-multiply' : 'drop-shadow-lg'
                  }`}
                  onError={() => setLogoError(true)}
                />
              ) : (
                <div className="h-10 w-10 md:h-11 md:w-11 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-md shadow-primary/20">
                  <span className="font-display font-bold text-white text-sm">IYC</span>
                </div>
              )}
              <div className="hidden sm:block leading-tight">
                <span
                  className={`font-display font-bold text-sm block ${
                    showBar ? 'text-navy' : 'text-white drop-shadow-md'
                  }`}
                >
                  Indian Youth Conference
                </span>
                <span
                  className={`text-[10px] font-semibold tracking-[0.2em] uppercase ${
                    showBar ? 'text-primary' : 'text-white/70'
                  }`}
                >
                  {EVENT.year}
                </span>
              </div>
            </Link>

            <nav className="hidden lg:flex items-center gap-1">
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.path}
                  to={link.path}
                  end={link.path === '/'}
                  className={({ isActive }) =>
                    `relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? showBar
                          ? 'text-primary font-semibold'
                          : 'text-white font-semibold'
                        : showBar
                          ? 'text-gray-600 hover:text-primary hover:bg-primary/5'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {isActive && (
                        <motion.span
                          layoutId="nav-indicator"
                          className={`absolute bottom-0.5 left-3 right-3 h-0.5 rounded-full ${
                            showBar
                              ? 'bg-gradient-to-r from-primary to-secondary'
                              : 'bg-accent'
                          }`}
                        />
                      )}
                    </>
                  )}
                </NavLink>
              ))}
            </nav>

            <div className="hidden lg:flex items-center shrink-0">
              <Button to="/register" variant="primary" size="sm">
                <Sparkles size={14} />
                Register
              </Button>
            </div>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className={`lg:hidden p-2.5 rounded-xl transition-all shrink-0 ${
                showBar
                  ? 'text-navy hover:bg-gray-100'
                  : 'text-white bg-white/10 backdrop-blur-sm hover:bg-white/20'
              }`}
              aria-label="Toggle menu"
            >
              {isOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] lg:hidden"
          >
            <div
              className="absolute inset-0 bg-navy/80 backdrop-blur-md"
              onClick={() => setIsOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="absolute right-0 top-0 bottom-0 w-[min(320px,85vw)] bg-white shadow-2xl flex flex-col p-6 pt-20"
            >
              {NAV_LINKS.map((link, i) => (
                <motion.div
                  key={link.path}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <NavLink
                    to={link.path}
                    end={link.path === '/'}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                      `block px-4 py-3.5 rounded-xl font-medium text-base mb-1 transition-colors ${
                        isActive
                          ? 'text-primary bg-primary/8 font-semibold'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`
                    }
                  >
                    {link.label}
                  </NavLink>
                </motion.div>
              ))}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div onClick={() => setIsOpen(false)}>
                  <Button to="/register" variant="primary" className="w-full">
                    Register Now
                  </Button>
                </div>
              </div>
            </motion.nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
