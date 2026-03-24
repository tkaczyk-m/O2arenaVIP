import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, ArrowLeft, Ticket, Zap, AlertCircle, ChevronRight } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getEventDetail, getEventAllocations } from '@/lib/mockData'
import StatusBadge from '@/components/shared/StatusBadge'
import CountdownTimer from '@/components/shared/CountdownTimer'

const CATEGORY_LABELS = {
  cs: { CONCERT: 'Koncert', HOCKEY: 'Hokej', BASKETBALL: 'Basketbal', FOOTBALL: 'Fotbal', OTHER: 'Akce' },
  en: { CONCERT: 'Concert', HOCKEY: 'Hockey', BASKETBALL: 'Basketball', FOOTBALL: 'Football', OTHER: 'Event' },
}

function formatDateTime(dateStr, locale) {
  const d = new Date(dateStr)
  const date = d.toLocaleDateString(locale === 'cs' ? 'cs-CZ' : 'en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
  const time = d.toLocaleTimeString('cs-CZ', { hour: '2-digit', minute: '2-digit' })
  return { date, time }
}

function AllocationCard({ alloc, t }) {
  const kindConfig = {
    TYPE1: { label: 'Smluvní místo', color: '#0066cc', desc: 'Pronájem + catering povinný' },
    TYPE2: { label: 'Benefit — váš výběr', color: '#7c3aed', desc: 'Zdarma z benefit kreditu, aktivní výběr' },
    TYPE3: { label: 'Benefit — automaticky', color: '#059669', desc: 'Zdarma z benefit kreditu, přiřazeno automaticky' },
  }[alloc.kind] || {}

  const isPending = alloc.status === 'OPTION_PENDING'
  const isAuto = alloc.status === 'AUTO_CONFIRMED'

  return (
    <div
      className="rounded-xl p-4 border"
      style={{ borderColor: `${kindConfig.color}40`, backgroundColor: `${kindConfig.color}08` }}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <span
            className="text-xs font-semibold px-2 py-0.5 rounded-full"
            style={{ color: kindConfig.color, backgroundColor: `${kindConfig.color}18` }}
          >
            {kindConfig.label}
          </span>
        </div>
        <StatusBadge
          status={alloc.status}
          label={t(`event.status.${alloc.status}`)}
          color={isPending ? 'amber' : isAuto ? 'blue' : 'green'}
        />
      </div>

      <p className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>
        {kindConfig.desc}
      </p>

      {alloc.kind === 'TYPE1' && (
        <div className="text-xs space-y-1" style={{ color: 'var(--color-text-muted)' }}>
          {alloc.skyboxes?.length > 0 && (
            <div>Skyboxy: <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{alloc.skyboxes.join(', ')}</span></div>
          )}
          {alloc.clubSections?.length > 0 && (
            <div>Sekce: <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{alloc.clubSections.join(', ')}</span></div>
          )}
          <div>
            Pronájem:&nbsp;
            <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>
              {alloc.venueFeeCZKPerSkybox
                ? `${alloc.venueFeeCZKPerSkybox.toLocaleString('cs-CZ')} Kč/skybox`
                : `${alloc.venueFeeCZKPerSeat?.toLocaleString('cs-CZ')} Kč/sedadlo`
              }
            </span>
          </div>
        </div>
      )}

      {(alloc.kind === 'TYPE2' || alloc.kind === 'TYPE3') && (
        <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
          Dostupné vstupenky:&nbsp;
          <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{alloc.availableCount}</span>
          &nbsp;·&nbsp;Hodnota:&nbsp;
          <span style={{ color: 'var(--color-text)', fontWeight: 500 }}>{alloc.benefitValueCZK?.toLocaleString('cs-CZ')} Kč/vs.</span>
        </div>
      )}

      {isPending && alloc.optionDeadline && (
        <div className="mt-2 pt-2 border-t" style={{ borderColor: `${kindConfig.color}30` }}>
          <CountdownTimer deadline={alloc.optionDeadline} />
        </div>
      )}
    </div>
  )
}

export default function EventDetailPage() {
  const { eventId } = useParams()
  const { t, currentPartner, locale, brand } = useApp()
  const [event, setEvent] = useState(null)
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentPartner) return
    Promise.all([
      getEventDetail(eventId),
      getEventAllocations(currentPartner.id, eventId),
    ]).then(([ev, allocs]) => {
      setEvent(ev)
      setAllocations(allocs)
      setLoading(false)
    })
  }, [eventId, currentPartner])

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 rounded-lg w-64" style={{ backgroundColor: 'var(--color-surface-2)' }} />
        <div className="h-48 rounded-xl" style={{ backgroundColor: 'var(--color-surface-2)' }} />
      </div>
    )
  }

  if (!event) {
    return (
      <div className="text-center py-16" style={{ color: 'var(--color-text-muted)' }}>
        Akce nenalezena.
      </div>
    )
  }

  const { date, time } = formatDateTime(event.date, locale)
  const catLabel = CATEGORY_LABELS[locale]?.[event.category] || event.category

  const hasPending = allocations.some(a => a.status === 'OPTION_PENDING')
  const hasAuto = allocations.some(a => a.status === 'AUTO_CONFIRMED' && a.kind === 'TYPE3')
  const hasConfirmed = allocations.some(a => a.status === 'CONFIRMED')
  const soonestDeadline = allocations
    .filter(a => a.optionDeadline && a.status === 'OPTION_PENDING')
    .map(a => new Date(a.optionDeadline))
    .sort((a, b) => a - b)[0]

  const venueName = event.venue?.name || 'O2 Arena Praha'
  const venueCity = event.venue?.city || 'Praha'

  return (
    <div className="animate-fade-in max-w-3xl">
      {/* Back */}
      <Link to="/dashboard" className="btn-ghost mb-4 inline-flex">
        <ArrowLeft size={15} />
        {t('common.back')}
      </Link>

      {/* Hero photo */}
      <div className="card rounded-2xl overflow-hidden mb-6">
        <div
          className="relative h-52 sm:h-72 overflow-hidden"
          style={{ backgroundColor: event.imageColor || '#1a1a2e' }}
        >
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.name}
              className="w-full h-full object-cover"
            />
          )}
          {/* Gradient overlay */}
          <div
            className="absolute inset-0"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 60%, transparent 100%)' }}
          />
          {/* Category + genre badge */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span
              className="text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
            >
              {catLabel}
            </span>
            {event.genre && (
              <span
                className="text-xs font-medium px-2.5 py-1 rounded-full backdrop-blur-sm"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#fff', border: '1px solid rgba(255,255,255,0.25)' }}
              >
                {event.genre}
              </span>
            )}
          </div>
          {/* Title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
            <h1 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-0.5">
              {event.name}
            </h1>
            {event.subtitle && (
              <p className="text-sm text-white/75">{event.subtitle}</p>
            )}
          </div>
        </div>

        {/* Info row */}
        <div className="px-5 py-4 flex flex-wrap gap-4 text-sm border-b" style={{ borderColor: 'var(--color-border)' }}>
          <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
            <Calendar size={14} className="shrink-0" style={{ color: 'var(--color-primary)' }} />
            <span>{date}</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
            <Clock size={14} className="shrink-0" style={{ color: 'var(--color-primary)' }} />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2" style={{ color: 'var(--color-text-muted)' }}>
            <MapPin size={14} className="shrink-0" style={{ color: 'var(--color-primary)' }} />
            <span>{venueName}, {venueCity}</span>
          </div>
        </div>

        {/* Description */}
        {event.description && (
          <div className="px-5 py-4 text-sm leading-relaxed" style={{ color: 'var(--color-text-muted)' }}>
            {event.description}
          </div>
        )}

        {/* Alerts */}
        {(hasPending || hasAuto) && (
          <div className="px-5 pb-4 space-y-2">
            {hasPending && soonestDeadline && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ backgroundColor: 'rgba(217, 119, 6, 0.1)', border: '1px solid rgba(217, 119, 6, 0.3)' }}
              >
                <AlertCircle size={14} className="text-amber-600 shrink-0" />
                <span className="text-amber-700 dark:text-amber-400">
                  {t('event.optionExpires')}:&nbsp;<CountdownTimer deadline={soonestDeadline} />
                </span>
              </div>
            )}
            {hasAuto && !hasPending && (
              <div
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
                style={{ backgroundColor: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)' }}
              >
                <Zap size={14} className="text-blue-600 shrink-0" />
                <span style={{ color: '#2563eb' }}>{t('event.autoAssigned')}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Allocations */}
      {allocations.length > 0 && (
        <div className="mb-6">
          <h2 className="text-base font-semibold mb-3" style={{ color: 'var(--color-text)' }}>
            Vaše alokace na tuto akci
          </h2>
          <div className="space-y-3">
            {allocations.map(alloc => (
              <AllocationCard key={alloc.id} alloc={alloc} t={t} />
            ))}
          </div>
        </div>
      )}

      {/* CTA */}
      {(hasPending || hasAuto) && (
        <Link
          to={`/events/${eventId}/claim`}
          className="btn-primary py-3 w-full justify-center text-base"
        >
          <Ticket size={18} />
          {hasPending ? t('event.claimSeats') : 'Doplnit služby a potvrdit'}
          <ChevronRight size={18} />
        </Link>
      )}

      {hasConfirmed && !hasPending && !hasAuto && (
        <div className="card rounded-xl p-4 flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)' }}
          >
            <Ticket size={18} className="text-emerald-600" />
          </div>
          <div>
            <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>Potvrzeno</div>
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Vstupenky najdete v sekci{' '}
              <Link to="/account/tickets" className="underline" style={{ color: 'var(--color-primary)' }}>
                Distribuce vstupenek
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
