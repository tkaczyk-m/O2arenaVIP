import { useEffect, useState, useMemo } from 'react'
import { Ticket, Download, Gift, UserCheck } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getTickets } from '@/lib/mockData'
import AccountTabNav from '@/components/account/AccountTabNav'

const STATUS_CONFIG = {
  UNASSIGNED: { label: 'Nepřiřazeno', color: '#6b7280', bg: '#6b728018' },
  ASSIGNED:   { label: 'Přiřazeno',   color: '#2563eb', bg: '#2563eb18' },
  SENT:       { label: 'Darováno',    color: '#059669', bg: '#05966918' },
  RELEASED:   { label: 'Uvolněno',    color: '#d97706', bg: '#d9770618' },
}

function DarujModal({ defaultEmail, onConfirm, onClose }) {
  const [email, setEmail] = useState(defaultEmail || '')
  const [sending, setSending] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!email.trim()) return
    setSending(true)
    setTimeout(() => {
      onConfirm(email.trim())
      onClose()
    }, 400)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="card rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <h3 className="font-bold text-base mb-1" style={{ color: 'var(--color-text)' }}>
          Darovat vstupenku
        </h3>
        <p className="text-xs mb-4" style={{ color: 'var(--color-text-muted)' }}>
          Vstupenka bude odeslána na zadaný e-mail.
        </p>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
              E-mail příjemce
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="prijemce@firma.cz"
              className="input-field w-full"
              required
              autoFocus
            />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={sending} className="btn-primary flex-1 justify-center">
              {sending ? 'Odesílám…' : 'Odeslat vstupenku'}
            </button>
            <button type="button" onClick={onClose} className="btn-ghost flex-1 justify-center">
              Zrušit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function TicketRow({ ticket, onUpdate, currentUser }) {
  const [showDarujModal, setShowDarujModal] = useState(false)

  const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.UNASSIGNED
  const isAssigned = ticket.status === 'ASSIGNED'
  const isSent = ticket.status === 'SENT'
  const canDownload = isAssigned || isSent

  function handleDarovat(email) {
    onUpdate(ticket.id, { guestEmail: email, status: 'SENT' })
  }

  return (
    <div className="card rounded-xl p-4 mb-3">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded-full"
              style={{ color: cfg.color, backgroundColor: cfg.bg }}
            >
              {cfg.label}
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
              {ticket.id}
            </span>
          </div>
          <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
            {ticket.seatLabel}
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {canDownload && (
            <button
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium"
              style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-primary)' + '12' }}
              onClick={() => alert('Stahování eTicket (demo)')}
            >
              <Download size={12} />
              eTicket
            </button>
          )}
          {isAssigned && (
            <button
              onClick={() => setShowDarujModal(true)}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors"
              style={{ color: '#059669', backgroundColor: '#05966918' }}
            >
              <Gift size={12} />
              Darovat
            </button>
          )}
        </div>
      </div>

      {/* VIP account assignment (auto, read-only) */}
      <div className="rounded-lg px-3 py-2" style={{ backgroundColor: 'var(--color-surface-2)' }}>
        <div className="flex items-center gap-2">
          <UserCheck size={14} style={{ color: '#2563eb' }} />
          <div className="flex-1 min-w-0">
            <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
              {currentUser?.name}
            </span>
            <span className="mx-2 opacity-30">·</span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {currentUser?.email}
            </span>
          </div>
        </div>
        {isSent && ticket.guestEmail && (
          <div
            className="flex items-center gap-1.5 mt-1.5 pt-1.5 border-t"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <Gift size={11} style={{ color: '#059669' }} />
            <span className="text-xs" style={{ color: '#059669' }}>
              Darováno → {ticket.guestEmail}
            </span>
          </div>
        )}
      </div>

      {showDarujModal && (
        <DarujModal
          defaultEmail={currentUser?.email || ''}
          onConfirm={handleDarovat}
          onClose={() => setShowDarujModal(false)}
        />
      )}
    </div>
  )
}

function EventGroup({ eventName, tickets, onUpdate, currentUser }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
          {eventName}
        </h2>
        <button
          className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-lg font-medium"
          style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-primary)' + '12' }}
          onClick={() => alert(`Hromadné stažení vstupenek: ${eventName} (demo)`)}
        >
          <Download size={12} />
          Stáhnout vše
        </button>
      </div>
      {tickets.map(ticket => (
        <TicketRow
          key={ticket.id}
          ticket={ticket}
          onUpdate={onUpdate}
          currentUser={currentUser}
        />
      ))}
    </div>
  )
}

export default function TicketsPage() {
  const { currentPartner, currentUser } = useApp()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedEvent, setSelectedEvent] = useState('all')

  useEffect(() => {
    if (!currentPartner) return
    getTickets(currentPartner.id).then(data => {
      setTickets(data)
      setLoading(false)
    })
  }, [currentPartner])

  function handleUpdate(ticketId, changes) {
    setTickets(prev => prev.map(t => t.id === ticketId ? { ...t, ...changes } : t))
  }

  const eventNames = useMemo(
    () => [...new Set(tickets.map(t => t.eventName))],
    [tickets]
  )

  const grouped = useMemo(() => {
    const filtered = selectedEvent === 'all'
      ? tickets
      : tickets.filter(t => t.eventName === selectedEvent)
    return filtered.reduce((acc, t) => {
      if (!acc[t.eventName]) acc[t.eventName] = []
      acc[t.eventName].push(t)
      return acc
    }, {})
  }, [tickets, selectedEvent])

  const assignedCount = tickets.filter(t => t.status === 'ASSIGNED').length
  const sentCount = tickets.filter(t => t.status === 'SENT').length

  return (
    <div className="animate-fade-in max-w-3xl">
      <AccountTabNav />

      <h1 className="text-xl font-bold mb-5" style={{ color: 'var(--color-text)' }}>
        Distribuce vstupenek
      </h1>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-28 rounded-xl" style={{ backgroundColor: 'var(--color-surface-2)' }} />
          ))}
        </div>
      ) : tickets.length === 0 ? (
        <div className="card rounded-xl p-12 text-center">
          <Ticket size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-medium" style={{ color: 'var(--color-text-muted)' }}>Žádné vstupenky k distribuci</p>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Vstupenky se zde objeví po potvrzení objednávky.
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: 'Přiřazeno k účtu', value: assignedCount, color: '#2563eb' },
              { label: 'Darováno', value: sentCount, color: '#059669' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card rounded-xl p-3 text-center">
                <div className="text-lg font-bold" style={{ color }}>{value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Event filter pills — only if multiple events */}
          {eventNames.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setSelectedEvent('all')}
                className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
                style={{
                  backgroundColor: selectedEvent === 'all' ? 'var(--color-primary)' : 'var(--color-surface-2)',
                  color: selectedEvent === 'all' ? 'var(--color-primary-fg)' : 'var(--color-text-muted)',
                }}
              >
                Vše ({tickets.length})
              </button>
              {eventNames.map(name => {
                const count = tickets.filter(t => t.eventName === name).length
                return (
                  <button
                    key={name}
                    onClick={() => setSelectedEvent(name)}
                    className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors"
                    style={{
                      backgroundColor: selectedEvent === name ? 'var(--color-primary)' : 'var(--color-surface-2)',
                      color: selectedEvent === name ? 'var(--color-primary-fg)' : 'var(--color-text-muted)',
                    }}
                  >
                    {name} ({count})
                  </button>
                )
              })}
            </div>
          )}

          {/* Tickets grouped by event */}
          {Object.entries(grouped).map(([eventName, eventTickets]) => (
            <EventGroup
              key={eventName}
              eventName={eventName}
              tickets={eventTickets}
              onUpdate={handleUpdate}
              currentUser={currentUser}
            />
          ))}
        </>
      )}
    </div>
  )
}
