import { Navigate, Outlet, Link, useLocation } from 'react-router-dom'
import { LogOut, LayoutDashboard, ExternalLink, Calendar, MapPin } from 'lucide-react'
import { isLoggedIn, clearToken, getAdminRole } from '../../lib/adminApi'
import { EVENT } from '../../data/content'

export default function AdminLayout() {
  const location = useLocation()
  const role = getAdminRole()

  if (!isLoggedIn()) {
    return <Navigate to="/admin/login" replace />
  }

  return (
    <div className="min-h-screen flex bg-[#f0f2f8]">
      {/* Sidebar */}
      <aside className="hidden lg:flex w-64 flex-col fixed inset-y-0 left-0 z-40 bg-navy text-white">
        <div className="p-6 border-b border-white/10">
          <Link to="/admin" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
              <LayoutDashboard size={20} />
            </div>
            <div>
              <p className="font-display font-bold text-sm flex items-center gap-2">
                IYC Admin
                {role === 'viewer' && <span className="text-[9px] bg-white/15 border border-white/20 rounded-full px-1.5 py-0.5">View only</span>}
              </p>
              <p className="text-[10px] text-white/50 uppercase tracking-widest">Portal {role ? `· ${role}` : ''}</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          <Link
            to="/admin"
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
              location.pathname === '/admin'
                ? 'bg-white/15 text-white shadow-inner'
                : 'text-white/60 hover:bg-white/8 hover:text-white'
            }`}
          >
            <LayoutDashboard size={18} />
            Registrations
          </Link>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/60 hover:bg-white/8 hover:text-white transition-all"
          >
            <ExternalLink size={18} />
            View Website
          </a>
        </nav>

        <div className="p-4 m-4 rounded-2xl bg-white/8 border border-white/10">
          <p className="text-[10px] uppercase tracking-widest text-white/40 mb-2">Event</p>
          <p className="text-sm font-semibold text-white/90 mb-2">{EVENT.name}</p>
          <div className="space-y-1.5 text-xs text-white/50">
            <div className="flex items-center gap-2">
              <Calendar size={12} className="shrink-0 text-secondary" />
              {EVENT.dates}
            </div>
            <div className="flex items-start gap-2">
              <MapPin size={12} className="shrink-0 mt-0.5 text-secondary" />
              <span className="leading-snug">Mount Zion Campus, Pudukkottai</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10">
          <button
            type="button"
            onClick={() => { clearToken(); window.location.href = '/admin/login' }}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm text-white/60 hover:bg-red-500/15 hover:text-red-300 transition-all"
          >
            <LogOut size={18} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-gray-200 px-4 h-14 flex items-center justify-between">
          <Link to="/admin" className="font-display font-bold text-navy text-sm">IYC Admin</Link>
          <button
            type="button"
            onClick={() => { clearToken(); window.location.href = '/admin/login' }}
            className="p-2 text-gray-400 hover:text-primary"
          >
            <LogOut size={18} />
          </button>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
