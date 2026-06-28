import { useCallback, useEffect, useState } from 'react'
import {
  Search,
  Download,
  Filter,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Trash2,
  Users,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  X,
  Inbox,
  IndianRupee,
} from 'lucide-react'
import { motion } from 'framer-motion'
import {
  fetchRegistrations,
  fetchStats,
  exportCsv,
  type Registration,
  type RegistrationFilters,
} from '../../lib/adminApi'
import RegistrationModal from '../../components/admin/RegistrationModal'
import { deleteRegistration } from '../../lib/adminApi'

const STATUS_CONFIG = {
  pending: { badge: 'bg-amber-50 text-amber-700 ring-amber-200', dot: 'bg-amber-400', label: 'Pending' },
  verified: { badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', dot: 'bg-emerald-400', label: 'Verified' },
  rejected: { badge: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-400', label: 'Rejected' },
}

const EMPTY_FILTERS: RegistrationFilters = {
  page: 1,
  limit: 20,
  search: '',
  status: '',
  gender: '',
  occupation: '',
  programPreference: '',
  howDidYouKnow: '',
  pastAttendance: '',
  sectionConference: '',
  from: '',
  to: '',
}

function getInitials(name: string) {
  return name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
}

function activeFilterCount(filters: RegistrationFilters) {
  const keys: (keyof RegistrationFilters)[] = [
    'status', 'gender', 'occupation', 'programPreference',
    'howDidYouKnow', 'pastAttendance', 'sectionConference', 'from', 'to', 'search',
  ]
  return keys.filter((k) => filters[k]).length
}

export default function AdminDashboard() {
  const [filters, setFilters] = useState<RegistrationFilters>(EMPTY_FILTERS)
  const [searchInput, setSearchInput] = useState('')
  const [items, setItems] = useState<Registration[]>([])
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
  const [stats, setStats] = useState({ total: 0, pending: 0, verified: 0, rejected: 0 })
  const [loading, setLoading] = useState(true)
  const [exporting, setExporting] = useState(false)
  const [error, setError] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editOnOpen, setEditOnOpen] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  useEffect(() => {
    const t = setTimeout(() => {
      setFilters((prev) => ({ ...prev, search: searchInput, page: 1 }))
    }, 350)
    return () => clearTimeout(t)
  }, [searchInput])

  const loadData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [listData, statsData] = await Promise.all([
        fetchRegistrations(filters),
        fetchStats(),
      ])
      setItems(listData.items)
      setPagination(listData.pagination)
      setStats(statsData.stats)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    loadData()
  }, [loadData])

  const updateFilter = (key: keyof RegistrationFilters, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: key === 'page' ? Number(value) : 1 }))
  }

  const clearFilters = () => {
    setSearchInput('')
    setFilters(EMPTY_FILTERS)
  }

  const handleQuickDelete = async (e: React.MouseEvent, reg: Registration) => {
    e.stopPropagation()
    if (!window.confirm(`Delete registration for ${reg.fullName}? This cannot be undone.`)) return
    setDeletingId(reg._id)
    try {
      await deleteRegistration(reg._id)
      loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Delete failed')
    } finally {
      setDeletingId(null)
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const { page: _p, limit: _l, ...exportFilters } = filters
      await exportCsv(exportFilters)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Export failed')
    } finally {
      setExporting(false)
    }
  }

  const filterCount = activeFilterCount(filters)

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-primary mb-1">Dashboard</p>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-navy">Registrations</h1>
          <p className="text-gray-400 text-sm mt-1">
            {stats.total} total · {stats.pending} awaiting payment review
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-600 hover:border-primary/30 hover:text-primary transition-all shadow-sm"
          >
            <RefreshCw size={15} className={loading ? 'animate-spin' : ''} />
            <span className="hidden sm:inline">Refresh</span>
          </button>
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-primary to-secondary text-white text-sm font-semibold shadow-md shadow-primary/20 hover:shadow-lg transition-all disabled:opacity-60"
          >
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            Export CSV
          </button>
        </div>
      </div>

      {/* Stats — click to filter */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[
          { key: '', label: 'All', value: stats.total, icon: Users, gradient: 'from-primary/10 to-primary/5', iconColor: 'text-primary' },
          { key: 'pending', label: 'Pending', value: stats.pending, icon: Clock, gradient: 'from-amber-500/10 to-amber-500/5', iconColor: 'text-amber-500' },
          { key: 'verified', label: 'Verified', value: stats.verified, icon: CheckCircle, gradient: 'from-emerald-500/10 to-emerald-500/5', iconColor: 'text-emerald-500' },
          { key: 'rejected', label: 'Rejected', value: stats.rejected, icon: XCircle, gradient: 'from-red-500/10 to-red-500/5', iconColor: 'text-red-500' },
        ].map(({ key, label, value, icon: Icon, gradient, iconColor }) => (
          <button
            key={label}
            type="button"
            onClick={() => updateFilter('status', key)}
            className={`text-left rounded-2xl p-4 sm:p-5 bg-gradient-to-br ${gradient} border transition-all hover:scale-[1.02] active:scale-[0.98] ${
              filters.status === key
                ? 'border-primary/40 ring-2 ring-primary/20 bg-white shadow-md'
                : 'border-white bg-white shadow-sm hover:shadow-md'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-xl bg-white flex items-center justify-center shadow-sm ${iconColor}`}>
                <Icon size={18} />
              </div>
              {filters.status === key && (
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary">Active</span>
              )}
            </div>
            <p className="text-xs text-gray-400 font-medium">{label}</p>
            <p className="font-display text-2xl sm:text-3xl font-bold text-navy">{value}</p>
          </button>
        ))}
      </div>

      {/* Search & filters */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone or section..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50/50 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all"
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
              showFilters || filterCount > 0
                ? 'border-primary/30 bg-primary/5 text-primary'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'
            }`}
          >
            <Filter size={15} />
            Filters
            {filterCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-primary text-white text-[10px] font-bold flex items-center justify-center">
                {filterCount}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-gray-100 bg-gray-50/50 p-4 sm:p-5"
          >
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Filter by</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { key: 'occupation' as const, label: 'Occupation', options: ['', 'Student', 'Pastor', 'Missionary Volunteer', 'Working', 'Dependent'] },
                { key: 'gender' as const, label: 'Gender', options: ['', 'Male', 'Female'] },
                { key: 'programPreference' as const, label: 'Program', options: ['', 'All the Days', 'Only Over the Weekend'] },
                { key: 'howDidYouKnow' as const, label: 'Referral Source', options: ['', 'Facebook', 'WhatsApp', 'Instagram', 'Other'] },
                { key: 'pastAttendance' as const, label: 'Attended Before', options: ['', 'Yes', 'No'] },
              ].map(({ key, label, options }) => (
                <div key={key}>
                  <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">{label}</label>
                  <select
                    value={filters[key] as string}
                    onChange={(e) => updateFilter(key, e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    {options.map((o) => (
                      <option key={o || 'all'} value={o}>{o || `All ${label}s`}</option>
                    ))}
                  </select>
                </div>
              ))}
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">Section</label>
                <input
                  type="text"
                  placeholder="Conference name..."
                  value={filters.sectionConference}
                  onChange={(e) => updateFilter('sectionConference', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">From Date</label>
                <input type="date" value={filters.from} onChange={(e) => updateFilter('from', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
              <div>
                <label className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5 block">To Date</label>
                <input type="date" value={filters.to} onChange={(e) => updateFilter('to', e.target.value)} className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/20" />
              </div>
            </div>
            {filterCount > 0 && (
              <button type="button" onClick={clearFilters} className="mt-4 text-sm text-primary font-medium hover:underline flex items-center gap-1">
                <X size={14} /> Clear all filters
              </button>
            )}
          </motion.div>
        )}

        {error && (
          <div className="mx-4 sm:mx-5 mb-4 flex gap-2 items-center text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
            <XCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Loader2 className="animate-spin text-primary mb-3" size={32} />
              <p className="text-sm">Loading registrations...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <Inbox size={40} className="mb-3 opacity-40" />
              <p className="font-medium text-navy mb-1">No registrations found</p>
              <p className="text-sm">Try adjusting your filters or search term</p>
              {filterCount > 0 && (
                <button type="button" onClick={clearFilters} className="mt-4 text-sm text-primary font-medium hover:underline">
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-t border-gray-100 bg-gray-50/80">
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Registrant</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden md:table-cell">Section</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden lg:table-cell">Category</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Fee</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider">Payment</th>
                  <th className="px-5 py-3.5 text-left text-[10px] font-bold text-gray-400 uppercase tracking-wider hidden sm:table-cell">Date</th>
                  <th className="px-5 py-3.5 text-right text-[10px] font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {items.map((item) => {
                  const st = STATUS_CONFIG[item.status]
                  return (
                    <tr
                      key={item._id}
                      onClick={() => setSelectedId(item._id)}
                      className="hover:bg-primary/[0.03] cursor-pointer transition-colors group"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                            {getInitials(item.fullName)}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-navy text-sm truncate">{item.fullName}</p>
                            <p className="text-xs text-gray-400 truncate">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4 hidden md:table-cell">
                        <p className="text-sm text-gray-600 max-w-[160px] truncate">{item.sectionConference}</p>
                      </td>
                      <td className="px-5 py-4 hidden lg:table-cell">
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-lg">{item.occupation}</span>
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-0.5 text-sm font-bold text-navy">
                          <IndianRupee size={13} className="text-primary" />
                          {item.fee}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ring-1 ${st.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${st.dot}`} />
                          {st.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 hidden sm:table-cell text-xs text-gray-400">
                        {new Date(item.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={() => { setEditOnOpen(false); setSelectedId(item._id) }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-primary/10 hover:text-primary transition-all"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => { setEditOnOpen(true); setSelectedId(item._id) }}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-blue-50 hover:text-blue-600 transition-all"
                            title="Edit"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => handleQuickDelete(e, item)}
                            disabled={deletingId === item._id}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:bg-red-50 hover:text-red-600 transition-all disabled:opacity-50"
                            title="Delete"
                          >
                            {deletingId === item._id ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />}
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {!loading && pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 bg-gray-50/30">
            <p className="text-sm text-gray-400">
              Showing page <strong className="text-navy">{pagination.page}</strong> of {pagination.pages}
              <span className="hidden sm:inline"> · {pagination.total} registrations</span>
            </p>
            <div className="flex gap-1">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => updateFilter('page', pagination.page - 1)}
                className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:border-primary/30 hover:text-primary transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                disabled={pagination.page >= pagination.pages}
                onClick={() => updateFilter('page', pagination.page + 1)}
                className="p-2 rounded-lg border border-gray-200 bg-white disabled:opacity-40 hover:border-primary/30 hover:text-primary transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <RegistrationModal
        id={selectedId}
        startEditing={editOnOpen}
        onClose={() => { setSelectedId(null); setEditOnOpen(false) }}
        onUpdated={loadData}
      />
    </div>
  )
}
