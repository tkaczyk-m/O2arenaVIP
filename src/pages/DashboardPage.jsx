import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { Search, Calendar, ChevronRight, Filter, Ticket, CheckCircle2, Clock, Zap, AlertCircle } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getEventsForPartner } from '@/lib/mockData'
import StatusBadge from '@/components/shared/StatusBadge'
import CountdownTimer from '@/components/shared/CountdownTimer'
import clsx from 'clsx'

const CATEGORY_CONFIG = {
  CONCERT: { label: 'Koncert', labelEn: 'Concert', color: '#7c3aed', bg: '#7c3aed15' },
  HOCKEY: { label: 'Hokej', labelEn: 'Hockey', color: '#0f4c8c', bg: '#0f4c8c15' },
  BASKETBALL: { label: 'Basketbal', labelEn: 'Basketball', color: '#b91c1c', bg: '#b91c1c15' },
  FOOTBALL: { label: 'Fotbal', labelEn: 'Football', color: '#166534', bg: '#16653415' },
  OTHER: { label: 'Jiná akce', labelEn: 'Event', color: '#4b5563', bg: '#4b556315' },
}

function formatDate(dateStr, locale) {
  const d = new Date(dateStr)
  return d.toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
}

function KindPill({ kind }) {
  const config = {
    TYPE1: { label: 'Smluvní místo', color: '#0066cc' },
    TYPE2: { label: 'Benefit (výběr)', color: '#7c3aed' },
    TYPE3: { label: 'Benefit (auto)', color: '#059669' },
  }[kind] || { label: kind, color: '#6b7280' }

  return (
    <span
      className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium"
      style={{ color: config.color, backgroundColor: `${config.color}18` }}
    >
      {config.label}
    </span>
  )
}

function EventCard({ event, t, locale }) {
  const catConfig = CATEGORY_CONFIG[event.category] || CATEGORY_CONFIG.OTHER
  const catLabel = locale === 'cs' ? catConfig.label : catConfig.labelEn

  const isPending = event.displayStatus === 'OPTION_PENDING'
  const isAuto = event.displayStatus === 'AUTO_CONFIRMED'
  const isConfirmed = event.displayStatus === 'CONFIRMED'
  const isLapsed = event.displayStatus === 'LAPSED'

  const statusLabel = t(`event.status.${event.displayStatus}`)
  const statusColor = isPending ? 'amber' : isAuto ? 'blue' : isConfirmed ? 'green' : 'gray'

  const kinds = [...new Set(event.allocations.map(a => a.kind))]

  return (
    <div className="card rounded-xl overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col">
      {/* Event photo */}
      <div className="relative h-36 overflow-hidden bg-gray-200" style={{ backgroundColor: event.imageColor }}>
        {event.imageUrl && (
          <img
            src={event.imageUrl}
            alt={event.name}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        )}
        {/* Category badge overlay */}
        <div className="absolute top-2 left-2">
          <span
            className="badge text-xs backdrop-blur-sm"
            style={{ color: catConfig.color, backgroundColor: `rgba(255,255,255,0.88)` }}
          >
            {catLabel}
          </span>
        </div>
        <div className="absolute top-2 right-2">
          <StatusBadge status={event.displayStatus} label={statusLabel} color={statusColor} />
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-semibold text-sm leading-snug mb-0.5" style={{ color: 'var(--color-text)' }}>
          {event.name}
        </h3>
        {event.subtitle && (
          <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>{event.subtitle}</p>
        )}

        {/* Date & time */}
        <div className="flex items-center gap-1.5 text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
          <Calendar size={12} className="shrink-0" />
          <span>{formatDate(event.date, locale)}</span>
          <span className="opacity-40">·</span>
          <span>{formatTime(event.date)}</span>
        </div>

        {/* Allocation kinds */}
        <div className="flex flex-wrap gap-1 mb-3">
          {kinds.map(k => <KindPill key={k} kind={k} />)}
        </div>

        {/* Countdown / status info */}
        <div className="mt-auto">
          {isPending && event.soonestDeadline && (
            <div className="flex items-center gap-1.5 text-xs mb-3">
              <CountdownTimer deadline={event.soonestDeadline} />
            </div>
          )}
          {isAuto && (
            <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 mb-3">
              <Zap size={12} />
              <span>Automaticky přiřazeno</span>
            </div>
          )}
          {isLapsed && (
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
              <AlertCircle size={12} />
              <span>Opce propadla</span>
            </div>
          )}

          {/* Dual action buttons */}
          <div className="flex gap-2">
            {!isLapsed && (
              <Link
                to={`/events/${event.id}/claim`}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                style={{
                  backgroundColor: isPending ? 'var(--color-primary)' : 'var(--color-surface-2)',
                  color: isPending ? 'var(--color-primary-fg)' : 'var(--color-text)',
                  border: isPending ? 'none' : '1px solid var(--color-border)',
                }}
              >
                {isPending ? (
                  <><Ticket size={13} />{t('event.claimSeats')}</>
                ) : isAuto ? (
                  <><Zap size={13} />{t('event.viewTickets')}</>
                ) : (
                  <><CheckCircle2 size={13} />Potvrzeno</>
                )}
              </Link>
            )}
            <Link
              to={`/events/${event.id}`}
              className={clsx(
                'flex items-center justify-center gap-1 py-2 px-3 rounded-lg text-xs font-medium transition-all duration-150',
                isLapsed ? 'flex-1' : ''
              )}
              style={{
                color: 'var(--color-text-muted)',
                backgroundColor: 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
              }}
            >
              <ChevronRight size={13} />
              Detail
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card rounded-xl p-4 flex items-center gap-3">
      <div
        className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}18` }}
      >
        <Icon size={18} style={{ color }} />
      </div>
      <div>
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
        <div className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>{value}</div>
      </div>
    </div>
  )
}

const FILTERS = [
  { key: 'all', labelKey: 'dashboard.filterAll' },
  { key: 'OPTION_PENDING', labelKey: 'dashboard.filterPending' },
  { key: 'CONFIRMED', labelKey: 'dashboard.filterConfirmed' },
  { key: 'AUTO_CONFIRMED', labelKey: 'dashboard.filterAuto' },
  { key: 'LAPSED', labelKey: 'dashboard.filterLapsed' },
]

export default function DashboardPage() {
  const { t, currentPartner, locale } = useApp()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    if (!currentPartner) return
    setLoading(true)
    getEventsForPartner(currentPartner.id).then(data => {
      setEvents(data)
      setLoading(false)
    })
  }, [currentPartner])

  const filtered = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.subtitle?.toLowerCase().includes(search.toLowerCase())
      const matchesFilter = filter === 'all' || e.displayStatus === filter
      return matchesSearch && matchesFilter
    })
  }, [events, search, filter])

  // Stats
  const stats = useMemo(() => ({
    pending: events.filter(e => e.displayStatus === 'OPTION_PENDING').length,
    confirmed: events.filter(e => e.displayStatus === 'CONFIRMED' || e.displayStatus === 'AUTO_CONFIRMED').length,
    budget: currentPartner?.benefitBudgetCZK > 0
      ? `${((currentPartner.benefitBudgetCZK - currentPartner.spentBenefitCZK) / 1000).toFixed(0)}k Kč`
      : null,
  }), [events, currentPartner])

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
          {t('dashboard.title')}
        </h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {t('dashboard.subtitle')}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        <StatCard
          icon={Clock}
          label={t('dashboard.stats.pending')}
          value={stats.pending}
          color="#d97706"
        />
        <StatCard
          icon={CheckCircle2}
          label={t('dashboard.stats.confirmed')}
          value={stats.confirmed}
          color="var(--color-primary)"
        />
        {stats.budget && (
          <StatCard
            icon={Ticket}
            label={t('dashboard.stats.budget')}
            value={stats.budget}
            color="#7c3aed"
          />
        )}
      </div>

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('dashboard.searchPlaceholder')}
            className="input-field pl-9"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={clsx(
                'shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 whitespace-nowrap',
              )}
              style={{
                backgroundColor: filter === f.key ? 'var(--color-primary)' : 'var(--color-surface)',
                color: filter === f.key ? 'var(--color-primary-fg)' : 'var(--color-text-muted)',
                border: filter === f.key ? 'none' : '1px solid var(--color-border)',
              }}
            >
              {t(f.labelKey)}
            </button>
          ))}
        </div>
      </div>

      {/* Event grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="card rounded-xl h-52 animate-pulse" style={{ backgroundColor: 'var(--color-surface-2)' }} />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div
          className="card rounded-xl p-12 text-center"
        >
          <Calendar size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-medium" style={{ color: 'var(--color-text-muted)' }}>
            {t('dashboard.noEvents')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(event => (
            <EventCard key={event.id} event={event} t={t} locale={locale} />
          ))}
        </div>
      )}
    </div>
  )
}
