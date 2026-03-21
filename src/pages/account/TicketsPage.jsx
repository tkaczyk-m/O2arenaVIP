import { useEffect, useState } from 'react'
import { Ticket, Send, Download, Edit3, Check, X, UserCheck, AlertCircle } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getTickets } from '@/lib/mockData'
import AccountTabNav from '@/components/account/AccountTabNav'

const STATUS_CONFIG = {
  UNASSIGNED: { label: 'Nepřiřazeno', color: '#6b7280', bg: '#6b728018' },
  ASSIGNED:   { label: 'Přiřazeno', color: '#2563eb', bg: '#2563eb18' },
  SENT:       { label: 'Odesláno', color: '#059669', bg: '#05966918' },
  RELEASED:   { label: 'Uvolněno', color: '#d97706', bg: '#d9770618' },
}

function TicketRow({ ticket, onUpdate }) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(ticket.guestName || '')
  const [email, setEmail] = useState(ticket.guestEmail || '')
  const [saving, setSaving] = useState(false)

  const cfg = STATUS_CONFIG[ticket.status] || STATUS_CONFIG.UNASSIGNED
  const isUnassigned = ticket.status === 'UNASSIGNED'

  function handleSave() {
    if (!name.trim() || !email.trim()) return
    setSaving(true)
    setTimeout(() => {
      onUpdate(ticket.id, { guestName: name.trim(), guestEmail: email.trim(), status: 'ASSIGNED' })
      setEditing(false)
      setSaving(false)
    }, 400)
  }

  function handleCancel() {
    setName(ticket.guestName || '')
    setEmail(ticket.guestEmail || '')
    setEditing(false)
  }

  function handleSend() {
    if (ticket.status !== 'ASSIGNED') return
    setTimeout(() => {
      onUpdate(ticket.id, { status: 'SENT' })
    }, 300)
  }

  return (
    <div
      className="card rounded-xl p-4 mb-3"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded-full"
              style={{ color: cfg.color, backgroundColor: cfg.bg }}
            >
              {cfg.label}
            </span>
            <span className="text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>{ticket.id}</span>
          </div>
          <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
            {ticket.seatLabel}
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            {ticket.eventName}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {ticket.status === 'ASSIGNED' && (
            <button
              onClick={handleSend}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium transition-colors"
              style={{ color: '#059669', backgroundColor: '#05966918' }}
              title="Odeslat e-ticket hostu"
            >
              <Send size={12} />
              Odeslat
            </button>
          )}
          {ticket.status === 'SENT' && (
            <button
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg font-medium"
              style={{ color: 'var(--color-primary)', backgroundColor: 'var(--color-primary)' + '12' }}
              onClick={() => alert('Stahování eTicket (demo)')}
            >
              <Download size={12} />
              eTicket
            </button>
          )}
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="p-1.5 rounded-lg transition-colors"
              style={{ color: 'var(--color-text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              title="Upravit přiřazení"
            >
              <Edit3 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Guest info */}
      {!editing ? (
        <div
          className="rounded-lg px-3 py-2 flex items-center gap-2"
          style={{ backgroundColor: 'var(--color-surface-2)' }}
        >
          {isUnassigned ? (
            <>
              <AlertCircle size={14} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-xs italic" style={{ color: 'var(--color-text-muted)' }}>
                Vstupenka není přiřazena — klikněte na tužku pro přiřazení hosta
              </span>
            </>
          ) : (
            <>
              <UserCheck size={14} style={{ color: '#2563eb' }} />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  {ticket.guestName}
                </span>
                <span className="mx-2 opacity-30">·</span>
                <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  {ticket.guestEmail}
                </span>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jméno a příjmení hosta"
              className="input-field text-sm"
            />
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="E-mail hosta"
              className="input-field text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={saving || !name.trim() || !email.trim()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-primary)',
                color: 'var(--color-primary-fg)',
              }}
            >
              <Check size={13} />
              {saving ? 'Ukládám…' : 'Uložit'}
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              style={{
                color: 'var(--color-text-muted)',
                backgroundColor: 'var(--color-surface-2)',
              }}
            >
              <X size={13} />
              Zrušit
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function TicketsPage() {
  const { currentPartner } = useApp()
  const [tickets, setTickets] = useState([])
  const [loading, setLoading] = useState(true)

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

  const unassignedCount = tickets.filter(t => t.status === 'UNASSIGNED').length
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
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Nepřiřazeno', value: unassignedCount, color: '#6b7280' },
              { label: 'Přiřazeno', value: assignedCount, color: '#2563eb' },
              { label: 'Odesláno', value: sentCount, color: '#059669' },
            ].map(({ label, value, color }) => (
              <div key={label} className="card rounded-xl p-3 text-center">
                <div className="text-lg font-bold" style={{ color }}>{value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>

          {unassignedCount > 0 && (
            <div
              className="flex items-center gap-2 px-3 py-2.5 rounded-lg mb-4 text-sm"
              style={{ backgroundColor: 'rgba(234,179,8,0.1)', border: '1px solid rgba(234,179,8,0.25)' }}
            >
              <AlertCircle size={15} className="text-amber-500 shrink-0" />
              <span className="text-amber-700 dark:text-amber-400">
                {unassignedCount} {unassignedCount === 1 ? 'vstupenka čeká' : 'vstupenek čeká'} na přiřazení hostu
              </span>
            </div>
          )}

          {tickets.map(ticket => (
            <TicketRow key={ticket.id} ticket={ticket} onUpdate={handleUpdate} />
          ))}
        </>
      )}
    </div>
  )
}
