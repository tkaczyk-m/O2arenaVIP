import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Plus, Trash2, X } from 'lucide-react'
import { getEvent, saveEvent, deleteEvent, generateEventId } from '@/lib/eventStore'
import { getAdminSession } from '@/lib/adminAuth'

const ADMIN_BLUE = '#1a5dab'

const CATEGORIES = [
  { value: 'CONCERT',    label: 'Koncert' },
  { value: 'HOCKEY',     label: 'Hokej' },
  { value: 'BASKETBALL', label: 'Basketbal' },
  { value: 'FOOTBALL',   label: 'Fotbal' },
  { value: 'OTHER',      label: 'Jiná akce' },
]

function toInputDt(iso) {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = n => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function fromInputDt(str) {
  return str ? new Date(str).toISOString() : null
}

const EMPTY_FORM = {
  name: '',
  subtitle: '',
  category: 'CONCERT',
  description: '',
  imageUrl: '',
  imageColor: '#7c3aed',
  date: '',
  doorsOpen: '',
  additionalDates: [],
  venueName: '',
  venueAddress: '',
  venueCity: '',
  organizer: '',
  prices: [],
  downloads: [],
  homeAway: '',
  published: true,
}

export default function AdminEventFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const session = getAdminSession()

  const [form, setForm] = useState(EMPTY_FORM)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isEdit && id) {
      const ev = getEvent(id)
      if (ev) {
        setForm({
          name: ev.name || '',
          subtitle: ev.subtitle || '',
          category: ev.category || 'CONCERT',
          description: ev.description || '',
          imageUrl: ev.imageUrl || '',
          imageColor: ev.imageColor || '#7c3aed',
          date: toInputDt(ev.date),
          doorsOpen: toInputDt(ev.doorsOpen),
          additionalDates: (ev.additionalDates || []).map(d => ({
            date: toInputDt(d.date),
            doorsOpen: toInputDt(d.doorsOpen),
          })),
          venueName: ev.venue?.name || '',
          venueAddress: ev.venue?.address || '',
          venueCity: ev.venue?.city || '',
          organizer: ev.organizer || '',
          prices: ev.prices || [],
          downloads: ev.downloads || [],
          homeAway: ev.homeAway || '',
          published: ev.published ?? true,
        })
      }
    }
  }, [id, isEdit])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (!form.name.trim()) { setError('Název události je povinný.'); return }
    if (!form.date) { setError('Datum začátku je povinné.'); return }

    setSaving(true)
    const existing = isEdit ? getEvent(id) : null
    const event = {
      id: isEdit ? id : generateEventId(),
      brandKey: session.brandKey,
      name: form.name.trim(),
      subtitle: form.subtitle.trim(),
      category: form.category,
      description: form.description.trim(),
      imageUrl: form.imageUrl.trim() || null,
      imageColor: form.imageColor,
      date: fromInputDt(form.date),
      doorsOpen: fromInputDt(form.doorsOpen) || fromInputDt(form.date),
      additionalDates: form.additionalDates
        .filter(d => d.date)
        .map(d => ({ date: fromInputDt(d.date), doorsOpen: fromInputDt(d.doorsOpen) || fromInputDt(d.date) })),
      venue: {
        name: form.venueName.trim(),
        address: form.venueAddress.trim(),
        city: form.venueCity.trim(),
      },
      organizer: form.organizer.trim(),
      prices: form.prices.filter(p => p.label.trim()),
      downloads: form.downloads.filter(d => d.label.trim()),
      homeAway: form.homeAway || null,
      published: form.published,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    setTimeout(() => {
      saveEvent(event)
      navigate('/admin/events')
    }, 300)
  }

  const addAdditionalDate = () =>
    set('additionalDates', [...form.additionalDates, { date: '', doorsOpen: '' }])

  const removeAdditionalDate = (i) =>
    set('additionalDates', form.additionalDates.filter((_, idx) => idx !== i))

  const updateAdditionalDate = (i, key, val) =>
    set('additionalDates', form.additionalDates.map((d, idx) => idx === i ? { ...d, [key]: val } : d))

  const addPrice = () => set('prices', [...form.prices, { label: '', amount: 0 }])
  const removePrice = (i) => set('prices', form.prices.filter((_, idx) => idx !== i))
  const updatePrice = (i, key, val) =>
    set('prices', form.prices.map((p, idx) => idx === i ? { ...p, [key]: val } : p))

  const addDownload = () => set('downloads', [...form.downloads, { label: '', url: '' }])
  const removeDownload = (i) => set('downloads', form.downloads.filter((_, idx) => idx !== i))
  const updateDownload = (i, key, val) =>
    set('downloads', form.downloads.map((d, idx) => idx === i ? { ...d, [key]: val } : d))

  return (
    <div>
      {/* Page header */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '20px', fontWeight: 700, color: '#222', margin: 0 }}>
          {isEdit ? 'Úprava termínu události' : 'Nový termín události'}
        </h1>
        <div style={{ fontSize: '12px', color: '#aaa', marginTop: '3px' }}>
          Domů › Události › Termíny › {isEdit ? 'Změna záznamu' : 'Nový záznam'}
        </div>
      </div>

      {/* Card */}
      <div style={{ backgroundColor: '#fff', border: '1px solid #ddd', borderRadius: '4px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #ddd', padding: '0 16px' }}>
          <TabBtn label="Seznam" onClick={() => navigate('/admin/events')} />
          <TabBtn label="Nový záznam" active={!isEdit} onClick={!isEdit ? undefined : () => navigate('/admin/events/new')} />
          {isEdit && <TabBtn label="Změna záznamu" active />}
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* ── Základní informace ── */}
            <Section title="Základní informace">
              <TwoCol>
                <Field label="Název události *">
                  <Input value={form.name} onChange={v => set('name', v)} placeholder="Název události" required />
                </Field>
                <Field label="Podtitul">
                  <Input value={form.subtitle} onChange={v => set('subtitle', v)} placeholder="Podtitul / interpret" />
                </Field>
              </TwoCol>
              <TwoCol>
                <Field label="Kategorie">
                  <Select value={form.category} onChange={v => set('category', v)} options={CATEGORIES} />
                </Field>
                <Field label="Typ utkání">
                  <Select
                    value={form.homeAway}
                    onChange={v => set('homeAway', v)}
                    options={[
                      { value: '', label: '— neuvedeno —' },
                      { value: 'home', label: 'Domácí' },
                      { value: 'away', label: 'Venkovní' },
                    ]}
                  />
                </Field>
              </TwoCol>
            </Section>

            {/* ── Datum a čas ── */}
            <Section title="Datum a čas">
              <TwoCol>
                <Field label="Začátek *">
                  <Input type="datetime-local" value={form.date} onChange={v => set('date', v)} required />
                </Field>
                <Field label="Otevření dveří">
                  <Input type="datetime-local" value={form.doorsOpen} onChange={v => set('doorsOpen', v)} />
                </Field>
              </TwoCol>

              {form.additionalDates.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#666', marginBottom: '8px' }}>
                    Další termíny
                  </div>
                  {form.additionalDates.map((d, i) => (
                    <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '8px' }}>
                      <Field label={`Termín ${i + 2} — Začátek`} style={{ flex: 1 }}>
                        <Input type="datetime-local" value={d.date} onChange={v => updateAdditionalDate(i, 'date', v)} />
                      </Field>
                      <Field label="Otevření dveří" style={{ flex: 1 }}>
                        <Input type="datetime-local" value={d.doorsOpen} onChange={v => updateAdditionalDate(i, 'doorsOpen', v)} />
                      </Field>
                      <button type="button" onClick={() => removeAdditionalDate(i)} style={removeBtn}>
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <button type="button" onClick={addAdditionalDate} style={addRowBtn}>
                <Plus size={13} /> Přidat další termín
              </button>
            </Section>

            {/* ── Popis a média ── */}
            <Section title="Popis a média">
              <Field label="Popis události">
                <textarea
                  value={form.description}
                  onChange={e => set('description', e.target.value)}
                  rows={4}
                  placeholder="Popis události pro B2B partnery…"
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </Field>
              <TwoCol>
                <Field label="URL obrázku">
                  <Input value={form.imageUrl} onChange={v => set('imageUrl', v)} placeholder="https://…" />
                </Field>
                <Field label="Barva události">
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={form.imageColor}
                      onChange={e => set('imageColor', e.target.value)}
                      style={{ width: '40px', height: '34px', padding: '2px', border: '1px solid #ccc', borderRadius: '4px', cursor: 'pointer' }}
                    />
                    <Input value={form.imageColor} onChange={v => set('imageColor', v)} placeholder="#7c3aed" style={{ flex: 1 }} />
                  </div>
                </Field>
              </TwoCol>
            </Section>

            {/* ── Místo konání ── */}
            <Section title="Místo konání">
              <TwoCol>
                <Field label="Název místa">
                  <Input value={form.venueName} onChange={v => set('venueName', v)} placeholder="O2 Arena Praha" />
                </Field>
                <Field label="Město">
                  <Input value={form.venueCity} onChange={v => set('venueCity', v)} placeholder="Praha 9" />
                </Field>
              </TwoCol>
              <Field label="Adresa">
                <Input value={form.venueAddress} onChange={v => set('venueAddress', v)} placeholder="Českomoravská 17" />
              </Field>
            </Section>

            {/* ── Organizátor ── */}
            <Section title="Organizátor">
              <Field label="Název organizátora">
                <Input value={form.organizer} onChange={v => set('organizer', v)} placeholder="Live Nation Czech Republic" />
              </Field>
            </Section>

            {/* ── Ceny ── */}
            <Section title="Ceník">
              {form.prices.map((p, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '8px' }}>
                  <Field label="Popis ceny" style={{ flex: 2 }}>
                    <Input value={p.label} onChange={v => updatePrice(i, 'label', v)} placeholder="VIP Skybox (10 osob)" />
                  </Field>
                  <Field label="Cena (Kč)" style={{ flex: 1 }}>
                    <Input
                      type="number"
                      value={p.amount}
                      onChange={v => updatePrice(i, 'amount', Number(v))}
                      placeholder="28000"
                    />
                  </Field>
                  <button type="button" onClick={() => removePrice(i)} style={removeBtn}>
                    <X size={13} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addPrice} style={addRowBtn}>
                <Plus size={13} /> Přidat cenovou kategorii
              </button>
            </Section>

            {/* ── Ke stažení ── */}
            <Section title="Ke stažení">
              {form.downloads.map((d, i) => (
                <div key={i} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', marginBottom: '8px' }}>
                  <Field label="Popis souboru" style={{ flex: 1 }}>
                    <Input value={d.label} onChange={v => updateDownload(i, 'label', v)} placeholder="Program akce" />
                  </Field>
                  <Field label="URL" style={{ flex: 2 }}>
                    <Input value={d.url} onChange={v => updateDownload(i, 'url', v)} placeholder="https://…" />
                  </Field>
                  <button type="button" onClick={() => removeDownload(i)} style={removeBtn}>
                    <X size={13} />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addDownload} style={addRowBtn}>
                <Plus size={13} /> Přidat soubor ke stažení
              </button>
            </Section>

            {/* ── Stav ── */}
            <Section title="Stav publikace">
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}>
                <div
                  onClick={() => set('published', !form.published)}
                  style={{
                    width: '40px', height: '22px',
                    borderRadius: '11px',
                    backgroundColor: form.published ? ADMIN_BLUE : '#ccc',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                    flexShrink: 0,
                  }}
                >
                  <div style={{
                    position: 'absolute',
                    top: '3px',
                    left: form.published ? '21px' : '3px',
                    width: '16px', height: '16px',
                    borderRadius: '50%',
                    backgroundColor: '#fff',
                    transition: 'left 0.2s',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                  }} />
                </div>
                <span style={{ fontSize: '13px', color: '#444', fontWeight: 500 }}>
                  {form.published ? 'Publikováno — viditelné pro B2B partnery' : 'Návrh — skryté pro B2B partnery'}
                </span>
              </label>
            </Section>

          </div>

          {/* Error */}
          {error && (
            <div style={{ margin: '0 24px 16px', padding: '8px 12px', backgroundColor: '#fff5f5', border: '1px solid #fca5a5', borderRadius: '4px', fontSize: '12.5px', color: '#b91c1c' }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{
            padding: '14px 24px',
            borderTop: '1px solid #e8e8e8',
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
          }}>
            <button
              type="button"
              onClick={() => navigate('/admin/events')}
              style={{ ...btnSecondary }}
            >
              Zpět na seznam
            </button>
            {isEdit && (
              <button
                type="button"
                onClick={() => {
                  const ev = getEvent(id)
                  if (ev && window.confirm(`Smazat událost „${ev.name}"?`)) {
                    deleteEvent(id)
                    navigate('/admin/events')
                  }
                }}
                style={btnDanger}
              >
                Smazat
              </button>
            )}
            <button
              type="submit"
              disabled={saving}
              style={{ ...btnPrimary, opacity: saving ? 0.7 : 1 }}
            >
              {saving ? 'Ukládám…' : (isEdit ? 'Uložit změny' : 'Vytvořit termín')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────────────────────

function TabBtn({ label, active, onClick }) {
  return (
    <button
      type="button"
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
      }}
    >
      {label}
    </button>
  )
}

function Section({ title, children }) {
  return (
    <div>
      <div style={{
        fontSize: '12px',
        fontWeight: 700,
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: '0.6px',
        marginBottom: '12px',
        paddingBottom: '6px',
        borderBottom: '1px solid #f0f0f0',
      }}>
        {title}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {children}
      </div>
    </div>
  )
}

function TwoCol({ children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
      {children}
    </div>
  )
}

function Field({ label, children, style }) {
  return (
    <div style={style}>
      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#555', marginBottom: '4px' }}>
        {label}
      </label>
      {children}
    </div>
  )
}

function Input({ value, onChange, type = 'text', placeholder, required, style: extraStyle }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      style={{ ...inputStyle, ...extraStyle }}
    />
  )
}

function Select({ value, onChange, options }) {
  return (
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{ ...inputStyle, cursor: 'pointer' }}
    >
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  )
}

const inputStyle = {
  width: '100%',
  padding: '7px 10px',
  border: '1px solid #ccc',
  borderRadius: '4px',
  fontSize: '13px',
  color: '#333',
  outline: 'none',
  boxSizing: 'border-box',
  backgroundColor: '#fff',
}

const removeBtn = {
  background: 'none',
  border: '1px solid #e5e7eb',
  borderRadius: '4px',
  cursor: 'pointer',
  color: '#dc2626',
  padding: '6px 8px',
  display: 'flex',
  alignItems: 'center',
  flexShrink: 0,
  marginBottom: '1px',
}

const addRowBtn = {
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  background: 'none',
  border: `1px dashed #ccc`,
  borderRadius: '4px',
  cursor: 'pointer',
  color: '#666',
  fontSize: '12px',
  padding: '6px 12px',
  marginTop: '4px',
  transition: 'border-color 0.15s, color 0.15s',
}

const btnPrimary = {
  backgroundColor: ADMIN_BLUE,
  color: '#fff',
  border: 'none',
  borderRadius: '4px',
  padding: '8px 20px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
}

const btnSecondary = {
  backgroundColor: '#fff',
  color: '#555',
  border: '1px solid #ccc',
  borderRadius: '4px',
  padding: '8px 16px',
  fontSize: '13px',
  cursor: 'pointer',
}

const btnDanger = {
  backgroundColor: '#fff',
  color: '#dc2626',
  border: '1px solid #fca5a5',
  borderRadius: '4px',
  padding: '8px 16px',
  fontSize: '13px',
  cursor: 'pointer',
}
