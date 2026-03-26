import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Eye, EyeOff, ArrowUpDown } from 'lucide-react'
import { getEvents, deleteEvent, saveEvent } from '@/lib/eventStore'
import { getAdminSession } from '@/lib/adminAuth'

const ADMIN_BLUE = '#1a5dab'

const CATEGORY_LABELS = {
  CONCERT: 'Koncert',
  HOCKEY: 'Hokej',
  BASKETBALL: 'Basketbal',
  FOOTBALL: 'Fotbal',
  OTHER: 'Jiná akce',
}

const HOME_AWAY_LABELS = {
  home: 'Domácí',
  away: 'Venkovní',
}

function formatDate(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function getDayLabel(iso) {
  if (!iso) return ''
  const days = ['Ne', 'Po', 'Út', 'St', 'Čt', 'Pá', 'So']
  return days[new Date(iso).getDay()]
}

export default function AdminEventsPage() {
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const navigate = useNavigate()
  const session = getAdminSession()

  const load = () => {
    if (session) setEvents(getEvents(session.brandKey))
  }

  useEffect(() => { load() }, [])

  const filtered = events.filter(e =>
    !search || e.name.toLowerCase().includes(search.toLowerCase())
  )

  const handleDelete = (ev) => {
    if (!window.confirm(`Smazat událost „${ev.name}"?`)) return
    deleteEvent(ev.id)
    load()
  }

  const handleTogglePublish = (ev) => {
    saveEvent({ ...ev, published: !ev.published })
    load()
  }

  return (
    <div>
      {/* Page header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#222', margin: 0 }}>
            Seznam termínů událostí
          </h1>
          <div style={{ fontSize: '12px', color: '#aaa', marginTop: '3px' }}>
            Domů › Události › Termíny
          </div>
        </div>
      </div>

      {/* Card */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd', padding: '0 16px' }}>
          <TabBtn label="Seznam" active />
          <TabBtn label="Přidat akci" onClick={() => navigate('/admin-event/events/new')} />
        </div>

        {/* Toolbar */}
        <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Vyhledávání: Akce"
              style={{ ...inputStyle, maxWidth: '260px' }}
            />
          </div>
          <button
            onClick={() => navigate('/admin-event/events/new')}
            style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              backgroundColor: ADMIN_BLUE, color: '#fff',
              border: 'none', borderRadius: '4px',
              padding: '7px 14px', fontSize: '12.5px', fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            Přidat akci
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12.5px' }}>
            <thead>
              <tr style={{ backgroundColor: '#fafafa', borderBottom: '1px solid #e8e8e8' }}>
                <Th label="Akce" />
                <Th label="Začátek" />
                <Th label="Den" />
                <Th label="Místo konání" />
                <Th label="Kategorie" />
                <Th label="Typ" />
                <Th label="Stav" />
                <th style={{ ...thStyle, width: '90px', textAlign: 'center' }}>Akce</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: '13px' }}>
                    Žádné záznamy
                  </td>
                </tr>
              ) : (
                filtered.map((ev, i) => (
                  <tr
                    key={ev.id}
                    style={{ borderBottom: '1px solid #f0f0f0', backgroundColor: i % 2 === 0 ? '#fff' : '#fafafa' }}
                  >
                    <td style={{ ...tdStyle, maxWidth: '260px' }}>
                      <button
                        onClick={() => navigate(`/admin-event/events/${ev.id}/edit`)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: ADMIN_BLUE, fontWeight: 500, fontSize: '12.5px', padding: 0, textAlign: 'left' }}
                      >
                        {ev.name}
                      </button>
                      {ev.subtitle && (
                        <div style={{ fontSize: '11px', color: '#999', marginTop: '2px' }}>{ev.subtitle}</div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <div>{formatDate(ev.date)}</div>
                      {ev.additionalDates?.length > 0 && (
                        <div style={{ fontSize: '11px', color: '#999' }}>+{ev.additionalDates.length} termín{ev.additionalDates.length > 1 ? 'y' : ''}</div>
                      )}
                    </td>
                    <td style={tdStyle}>{getDayLabel(ev.date)}</td>
                    <td style={{ ...tdStyle, maxWidth: '180px' }}>
                      <div style={{ fontWeight: 500 }}>{ev.venue?.name}</div>
                      {ev.venue?.city && (
                        <div style={{ fontSize: '11px', color: '#999' }}>{ev.venue.city}</div>
                      )}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: '#eef2ff',
                        color: '#3730a3',
                      }}>
                        {CATEGORY_LABELS[ev.category] || ev.category}
                      </span>
                    </td>
                    <td style={tdStyle}>
                      {ev.homeAway ? (
                        <span style={{
                          display: 'inline-block',
                          padding: '2px 8px',
                          borderRadius: '3px',
                          fontSize: '11px',
                          fontWeight: 600,
                          backgroundColor: ev.homeAway === 'home' ? '#ecfdf5' : '#fff7ed',
                          color: ev.homeAway === 'home' ? '#065f46' : '#9a3412',
                        }}>
                          {HOME_AWAY_LABELS[ev.homeAway]}
                        </span>
                      ) : <span style={{ color: '#ccc' }}>—</span>}
                    </td>
                    <td style={tdStyle}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontWeight: 600,
                        backgroundColor: ev.published ? '#ecfdf5' : '#f9fafb',
                        color: ev.published ? '#065f46' : '#6b7280',
                        border: `1px solid ${ev.published ? '#a7f3d0' : '#e5e7eb'}`,
                      }}>
                        {ev.published ? 'Publikováno' : 'Návrh'}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        <ActionBtn
                          icon={ev.published ? EyeOff : Eye}
                          title={ev.published ? 'Skrýt' : 'Publikovat'}
                          color={ev.published ? '#888' : '#059669'}
                          onClick={() => handleTogglePublish(ev)}
                        />
                        <ActionBtn
                          icon={Pencil}
                          title="Upravit"
                          color={ADMIN_BLUE}
                          onClick={() => navigate(`/admin-event/events/${ev.id}/edit`)}
                        />
                        <ActionBtn
                          icon={Trash2}
                          title="Smazat"
                          color="#dc2626';"
                          hoverColor="#dc2626"
                          onClick={() => handleDelete(ev)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div style={{ padding: '10px 16px', borderTop: '1px solid #f0f0f0', fontSize: '12px', color: '#888' }}>
          Záznamy {filtered.length > 0 ? '1' : '0'} až {filtered.length} z celkem {filtered.length}
        </div>
      </div>
    </div>
  )
}

function TabBtn({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '10px 16px',
        fontSize: '13px',
        fontWeight: active ? 600 : 400,
        color: active ? ADMIN_BLUE : '#555',
        background: 'none',
        border: 'none',
        borderBottom: active ? `2px solid ${ADMIN_BLUE}` : '2px solid transparent',
        cursor: onClick ? 'pointer' : 'default',
        marginBottom: '-1px',
        transition: 'color 0.1s',
      }}
    >
      {label}
    </button>
  )
}

function Th({ label }) {
  return (
    <th style={thStyle}>
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
        <ArrowUpDown size={10} style={{ opacity: 0.4 }} />
        {label}
      </span>
    </th>
  )
}

function ActionBtn({ icon: Icon, title, color, hoverColor, onClick }) {
  const [hovered, setHovered] = useState(false)
  return (
    <button
      title={title}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: '4px',
        borderRadius: '3px',
        color: hovered && hoverColor ? hoverColor : color,
        backgroundColor: hovered ? '#f5f5f5' : 'transparent',
        transition: 'background 0.1s, color 0.1s',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Icon size={14} />
    </button>
  )
}

const inputStyle = {
  width: '100%',
  padding: '6px 10px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '12.5px',
  color: '#333',
  outline: 'none',
  boxSizing: 'border-box',
}

const thStyle = {
  padding: '8px 12px',
  textAlign: 'left',
  fontWeight: 600,
  color: '#555',
  fontSize: '12px',
  whiteSpace: 'nowrap',
}

const tdStyle = {
  padding: '9px 12px',
  color: '#444',
  verticalAlign: 'middle',
}
