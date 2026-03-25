import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, X, ChevronLeft } from 'lucide-react'
import { useAdmin } from '@/context/AdminContext'
import { SKYBOXES, CLUB_SECTIONS } from '@/lib/mockData'
import SeatPicker from '@/components/arena/SeatPicker'

// ── Arena map constants ────────────────────────────────────────────────────────
const W = 800, H = 640
const CX = W / 2, CY = H / 2
const RX_OUTER = 340, RY_OUTER = 270
const RX_INNER = 200, RY_INNER = 155

const ALL_SKYBOX_IDS = Object.keys(SKYBOXES)   // SB-01…SB-28
const ALL_CLUB_IDS   = Object.keys(CLUB_SECTIONS) // '201'…'226'

// ── Allocation type options — add new types here to extend the UI ──────────────
const ALLOC_TYPE_OPTIONS = [
  {
    key: 'TYPE2',
    label: 'Benefit budget',
    description: 'Finanční limit pro bezplatné vstupenky z benefitního fondu',
    extra: { field: 'benefitBudgetCZK', label: 'Budget (Kč)', placeholder: '200000' },
  },
  {
    key: 'TYPE3',
    label: 'Automatické vstupenky',
    description: 'Vstupenky přiděleny automaticky bez potvrzení partnera',
  },
]

// ── Arena map (admin mode — all segments selectable) ──────────────────────────
function AdminArenaMap({ selectedSkyboxes, selectedSections, onToggleSkybox, onZoomSection, zoomedSection }) {
  const elements = []

  // Outer ring — 28 skyboxes, SB-01 to SB-28
  const totalUpper = 28
  for (let i = 0; i < totalUpper; i++) {
    const a1 = (-Math.PI / 2) + i * (2 * Math.PI / totalUpper)
    const a2 = a1 + (2 * Math.PI / totalUpper) * 0.9
    const path = [
      `M${CX + RX_OUTER * Math.cos(a1)},${CY + RY_OUTER * Math.sin(a1)}`,
      `L${CX + RX_OUTER * Math.cos(a2)},${CY + RY_OUTER * Math.sin(a2)}`,
      `L${CX + (RX_OUTER - 52) * Math.cos(a2)},${CY + (RY_OUTER - 40) * Math.sin(a2)}`,
      `L${CX + (RX_OUTER - 52) * Math.cos(a1)},${CY + (RY_OUTER - 40) * Math.sin(a1)} Z`,
    ].join(' ')
    const mid = (a1 + a2) / 2
    const lx = CX + (RX_OUTER - 26) * Math.cos(mid)
    const ly = CY + (RY_OUTER - 20) * Math.sin(mid)
    const sbId = `SB-${String(i + 1).padStart(2, '0')}`
    const isSelected = selectedSkyboxes.includes(sbId)

    elements.push(
      <g key={`u-${i}`} onClick={() => onToggleSkybox(sbId)} style={{ cursor: 'pointer' }}>
        <path
          d={path}
          fill={isSelected ? 'var(--color-primary)' : 'var(--color-primary-light)'}
          fillOpacity={isSelected ? 0.9 : 0.3}
          stroke="var(--color-surface)"
          strokeWidth="1.5"
        />
        <text
          x={lx} y={ly}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={8} fontWeight="600"
          fill={isSelected ? '#fff' : 'var(--color-primary)'}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {sbId}
        </text>
      </g>
    )
  }

  // Club ring — 26 sections, 201–226
  const totalClub = 26
  for (let i = 0; i < totalClub; i++) {
    const a1 = (-Math.PI / 2) + i * (2 * Math.PI / totalClub)
    const a2 = a1 + (2 * Math.PI / totalClub) * 0.88
    const path = [
      `M${CX + (RX_OUTER - 54) * Math.cos(a1)},${CY + (RY_OUTER - 42) * Math.sin(a1)}`,
      `L${CX + (RX_OUTER - 54) * Math.cos(a2)},${CY + (RY_OUTER - 42) * Math.sin(a2)}`,
      `L${CX + (RX_OUTER - 95) * Math.cos(a2)},${CY + (RY_OUTER - 73) * Math.sin(a2)}`,
      `L${CX + (RX_OUTER - 95) * Math.cos(a1)},${CY + (RY_OUTER - 73) * Math.sin(a1)} Z`,
    ].join(' ')
    const mid = (a1 + a2) / 2
    const lx = CX + (RX_OUTER - 74) * Math.cos(mid)
    const ly = CY + (RY_OUTER - 57) * Math.sin(mid)
    const sectionId = String(201 + i)
    const isSelected = selectedSections.includes(sectionId)
    const isZoomed  = zoomedSection === sectionId

    elements.push(
      <g key={`c-${i}`} onClick={() => onZoomSection(sectionId)} style={{ cursor: 'pointer' }}>
        <path
          d={path}
          fill={isZoomed ? 'var(--color-primary)' : isSelected ? 'var(--color-primary)' : 'var(--color-primary-light)'}
          fillOpacity={isZoomed ? 1 : isSelected ? 0.7 : 0.3}
          stroke="var(--color-surface)"
          strokeWidth="1.5"
        />
        <text
          x={lx} y={ly}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={7} fontWeight="600"
          fill={isSelected || isZoomed ? '#fff' : 'var(--color-primary)'}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {sectionId}
        </text>
      </g>
    )
  }

  // Floor ring (decorative)
  const totalFloor = 22
  for (let i = 0; i < totalFloor; i++) {
    const a1 = (-Math.PI / 2) + i * (2 * Math.PI / totalFloor)
    const a2 = a1 + (2 * Math.PI / totalFloor) * 0.88
    const path = [
      `M${CX + (RX_OUTER - 97) * Math.cos(a1)},${CY + (RY_OUTER - 75) * Math.sin(a1)}`,
      `L${CX + (RX_OUTER - 97) * Math.cos(a2)},${CY + (RY_OUTER - 75) * Math.sin(a2)}`,
      `L${CX + (RX_INNER + 32) * Math.cos(a2)},${CY + (RY_INNER + 26) * Math.sin(a2)}`,
      `L${CX + (RX_INNER + 32) * Math.cos(a1)},${CY + (RY_INNER + 26) * Math.sin(a1)} Z`,
    ].join(' ')
    elements.push(
      <path key={`f-${i}`} d={path} fill="var(--color-border)" fillOpacity={0.25} stroke="var(--color-surface)" strokeWidth="1" />
    )
  }

  elements.push(
    <ellipse key="ice" cx={CX} cy={CY} rx={RX_INNER - 10} ry={RY_INNER - 8}
      fill="var(--color-surface-2)" stroke="var(--color-border)" strokeWidth="1.5" />
  )

  return (
    <div className="w-full" style={{ maxWidth: 540 }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {elements}
      </svg>
    </div>
  )
}

// ── Form helpers ───────────────────────────────────────────────────────────────
function Field({ label, required, children, hint }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--color-text-muted)' }}>
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs mt-1" style={{ color: 'var(--color-text-subtle)' }}>{hint}</p>}
    </div>
  )
}

function Input({ value, onChange, placeholder, type = 'text', required }) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      className="w-full px-3 py-2 rounded-lg text-sm outline-none transition-all"
      style={{
        backgroundColor: 'var(--color-surface)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text)',
      }}
      onFocus={e => { e.target.style.borderColor = 'var(--color-primary)' }}
      onBlur={e => { e.target.style.borderColor = 'var(--color-border)' }}
    />
  )
}

function Section({ title, children }) {
  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface)' }}
    >
      <div
        className="px-5 py-3 text-xs font-semibold uppercase tracking-wide"
        style={{ backgroundColor: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)', color: 'var(--color-text-subtle)' }}
      >
        {title}
      </div>
      <div className="p-5 space-y-4">
        {children}
      </div>
    </div>
  )
}

// ── Main page ──────────────────────────────────────────────────────────────────
export default function ClientFormPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const navigate = useNavigate()
  const { partners, addPartner, updatePartner, activeBrand } = useAdmin()

  const existing = isNew ? null : partners.find(p => p.id === id)

  const [form, setForm] = useState({
    companyName: '',
    ico: '',
    address: '',
    contactFirstName: '',
    contactLastName: '',
    contactEmail: '',
    contractFrom: '',
    contractTo: '',
    contractAmount: '',
    selectedSkyboxes: [],
    clubSeatMap: {},        // { sectionId: ['1-1', '1-2', ...] }
    allocType1: false,
    allocType2: false,
    allocType3: false,
    benefitBudgetCZK: '',
  })
  const [zoomedSection, setZoomedSection] = useState(null)
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setForm({
        companyName:        existing.companyName || '',
        ico:                existing.ico || '',
        address:            existing.address || '',
        contactFirstName:   existing.contactPerson?.firstName || '',
        contactLastName:    existing.contactPerson?.lastName || '',
        contactEmail:       existing.contactPerson?.email || '',
        contractFrom:       existing.contract?.validFrom || '',
        contractTo:         existing.contract?.validTo || '',
        contractAmount:     existing.contract?.amountCZK ? String(existing.contract.amountCZK) : '',
        selectedSkyboxes:   existing.seats?.skyboxes || [],
        clubSeatMap:        existing.clubSeatMap || {},
        allocType1:         existing.allocationKinds?.includes('TYPE1') || false,
        allocType2:         existing.allocationKinds?.includes('TYPE2') || false,
        allocType3:         existing.allocationKinds?.includes('TYPE3') || false,
        benefitBudgetCZK:   existing.benefitBudgetCZK ? String(existing.benefitBudgetCZK) : '',
      })
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Derived: sections with at least 1 seat selected
  const selectedSections = Object.keys(form.clubSeatMap).filter(k => (form.clubSeatMap[k] || []).length > 0)

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }))

  const toggleSkybox = (sbId) => {
    setForm(f => ({
      ...f,
      selectedSkyboxes: f.selectedSkyboxes.includes(sbId)
        ? f.selectedSkyboxes.filter(s => s !== sbId)
        : [...f.selectedSkyboxes, sbId],
    }))
  }

  const toggleSectionSeat = (sectionId, seatKey) => {
    setForm(f => {
      const current = f.clubSeatMap[sectionId] || []
      const updated = current.includes(seatKey)
        ? current.filter(s => s !== seatKey)
        : [...current, seatKey]
      return { ...f, clubSeatMap: { ...f.clubSeatMap, [sectionId]: updated } }
    })
  }

  const removeSeat = (sectionId, seatKey) => {
    setForm(f => ({
      ...f,
      clubSeatMap: { ...f.clubSeatMap, [sectionId]: (f.clubSeatMap[sectionId] || []).filter(s => s !== seatKey) },
    }))
  }

  const clearSection = (sectionId) => {
    setForm(f => ({ ...f, clubSeatMap: { ...f.clubSeatMap, [sectionId]: [] } }))
  }

  const handleZoomSection = (sectionId) => {
    setZoomedSection(prev => prev === sectionId ? null : sectionId)
  }

  const validate = () => {
    const e = {}
    if (!form.companyName.trim()) e.companyName = 'Povinné pole'
    if (!form.contactFirstName.trim()) e.contactFirstName = 'Povinné pole'
    if (!form.contactLastName.trim()) e.contactLastName = 'Povinné pole'
    if (!form.contactEmail.trim()) e.contactEmail = 'Povinné pole'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.contactEmail)) e.contactEmail = 'Neplatný formát e-mailu'
    if (!form.contractFrom) e.contractFrom = 'Povinné pole'
    if (!form.contractTo) e.contractTo = 'Povinné pole'
    if (!form.contractAmount || isNaN(Number(form.contractAmount))) e.contractAmount = 'Zadejte číslo'
    if (form.allocType2 && (!form.benefitBudgetCZK || isNaN(Number(form.benefitBudgetCZK)))) e.benefitBudgetCZK = 'Zadejte číslo'
    if (!form.allocType1 && !form.allocType2 && !form.allocType3) e.allocTypes = 'Vyberte alespoň jeden typ alokace'
    return e
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const firstName = form.contactFirstName.trim()
    const lastName  = form.contactLastName.trim()
    const email     = form.contactEmail.trim()
    const initials  = (firstName[0] + (lastName[0] || '')).toUpperCase()

    const allocationKinds = [
      ...(form.allocType1 ? ['TYPE1'] : []),
      ...(form.allocType2 ? ['TYPE2'] : []),
      ...(form.allocType3 ? ['TYPE3'] : []),
    ]

    const data = {
      brandId: activeBrand?.key || 'o2arena',
      companyName: form.companyName.trim(),
      ico: form.ico.trim(),
      address: form.address.trim(),
      contactPerson: { firstName, lastName, email },
      contract: {
        id: existing?.contract?.id || `VIP-${Date.now()}`,
        type: existing?.contract?.type || 'Benefit Partner',
        validFrom: form.contractFrom,
        validTo: form.contractTo,
        amountCZK: Number(form.contractAmount),
        accountManagerName:  existing?.contract?.accountManagerName  || '',
        accountManagerEmail: existing?.contract?.accountManagerEmail || '',
        accountManagerPhone: existing?.contract?.accountManagerPhone || '',
      },
      seats: {
        skyboxes: form.selectedSkyboxes,
        clubSections: selectedSections,
      },
      clubSeatMap: form.clubSeatMap,
      type1Allocation: form.allocType1
        ? { skyboxes: form.selectedSkyboxes, clubSections: selectedSections }
        : null,
      allocationKinds,
      benefitBudgetCZK: form.allocType2 ? (Number(form.benefitBudgetCZK) || 0) : 0,
      spentBenefitCZK: existing?.spentBenefitCZK || 0,
    }

    if (isNew) {
      const partnerId = `partner-${Date.now()}`
      const userId    = `user-${Date.now()}`
      addPartner({
        ...data,
        id: partnerId,
        users: [{
          id: userId,
          partnerId,
          name: `${firstName} ${lastName}`,
          email,
          role: 'admin',
          initials,
          active: true,
        }],
      })
    } else {
      const existingUsers = existing.users || []
      const updatedUsers = existingUsers.length > 0
        ? existingUsers.map(u => u.role === 'admin' ? { ...u, name: `${firstName} ${lastName}`, email, initials } : u)
        : [{ id: `user-${Date.now()}`, partnerId: existing.id, name: `${firstName} ${lastName}`, email, role: 'admin', initials, active: true }]
      updatePartner(existing.id, { ...data, users: updatedUsers })
    }

    navigate('/admin-clients/clients')
  }

  const err = (key) => errors[key] ? <p className="text-xs mt-1 text-red-500">{errors[key]}</p> : null

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-subtle)' }}>
            Domů › Partneři › {isNew ? 'Nový záznam' : existing?.companyName || 'Změna záznamu'}
          </p>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            {isNew ? 'Nový partner' : `Úprava: ${existing?.companyName || ''}`}
          </h1>
        </div>
      </div>

      {/* Tabs */}
      <div
        className="rounded-t-xl flex items-center"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderBottomWidth: 0 }}
      >
        <button
          onClick={() => navigate('/admin-clients/clients')}
          className="px-5 py-3 text-sm font-medium border-b-2 -mb-px"
          style={{ borderBottomColor: 'transparent', color: 'var(--color-text-muted)' }}
        >
          Seznam
        </button>
        <button
          className="px-5 py-3 text-sm font-medium border-b-2 -mb-px"
          style={{ borderBottomColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
        >
          {isNew ? 'Nový záznam' : 'Změna záznamu'}
        </button>
      </div>

      <form onSubmit={handleSave}>
        <div
          className="rounded-b-xl p-6 space-y-5"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)', borderTopWidth: 0 }}
        >
          {/* Section 1: Company */}
          <Section title="Informace o partnerovi">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 md:col-span-1">
                <Field label="Název partnera" required>
                  <Input value={form.companyName} onChange={set('companyName')} placeholder="ŠKODA Auto a.s." required />
                  {err('companyName')}
                </Field>
              </div>
              <Field label="IČO">
                <Input value={form.ico} onChange={set('ico')} placeholder="00177041" />
              </Field>
              <div className="col-span-2">
                <Field label="Adresa">
                  <Input value={form.address} onChange={set('address')} placeholder="Ulice, PSČ Město" />
                </Field>
              </div>
            </div>
          </Section>

          {/* Section 2: Contact */}
          <Section title="Kontaktní osoba">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Jméno" required>
                <Input value={form.contactFirstName} onChange={set('contactFirstName')} placeholder="Barbora" required />
                {err('contactFirstName')}
              </Field>
              <Field label="Příjmení" required>
                <Input value={form.contactLastName} onChange={set('contactLastName')} placeholder="Chaloupecká" required />
                {err('contactLastName')}
              </Field>
              <div className="col-span-2">
                <Field label="E-mail (přihlášení do B2B portálu)" required>
                  <Input value={form.contactEmail} onChange={set('contactEmail')} placeholder="kontakt@firma.cz" type="email" required />
                  {err('contactEmail')}
                </Field>
              </div>
            </div>
          </Section>

          {/* Section 3: Contract */}
          <Section title="Smlouva">
            <div className="grid grid-cols-3 gap-4">
              <Field label="Platnost od" required>
                <Input value={form.contractFrom} onChange={set('contractFrom')} type="date" required />
                {err('contractFrom')}
              </Field>
              <Field label="Platnost do" required>
                <Input value={form.contractTo} onChange={set('contractTo')} type="date" required />
                {err('contractTo')}
              </Field>
              <Field label="Částka smlouvy (Kč)" required hint="Pouze číslo bez mezer">
                <Input value={form.contractAmount} onChange={set('contractAmount')} placeholder="1200000" required />
                {err('contractAmount')}
              </Field>
            </div>
          </Section>

          {/* Section 4: Seats — only visible when TYPE1 is enabled */}
          {form.allocType1 && (
          <Section title="Přidělená místa">
            <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
              <strong>Skybox:</strong> kliknutím na segment ve vnějším kruhu přiřaďte skybox. &nbsp;
              <strong>Klubová místa:</strong> kliknutím na segment ve vnitřním kruhu se zobrazí výběr sedadel.
            </p>

            <div className="flex gap-6 items-start">
              {/* Left: arena map or seat picker */}
              <div className="flex-1 min-w-0">
                {zoomedSection ? (
                  <div>
                    <button
                      type="button"
                      onClick={() => setZoomedSection(null)}
                      className="flex items-center gap-1 text-xs mb-3 transition-colors"
                      style={{ color: 'var(--color-primary)' }}
                    >
                      <ChevronLeft size={14} />
                      Zpět na mapu
                    </button>
                    <SeatPicker
                      sectionId={zoomedSection}
                      selectedSeats={form.clubSeatMap[zoomedSection] || []}
                      onToggleSeat={(seatKey) => toggleSectionSeat(zoomedSection, seatKey)}
                      unavailable={new Set()}
                    />
                  </div>
                ) : (
                  <AdminArenaMap
                    selectedSkyboxes={form.selectedSkyboxes}
                    selectedSections={selectedSections}
                    onToggleSkybox={toggleSkybox}
                    onZoomSection={handleZoomSection}
                    zoomedSection={zoomedSection}
                  />
                )}
              </div>

              {/* Right: selection summary */}
              <div className="w-56 shrink-0 space-y-4">
                {/* Selected skyboxes */}
                <div>
                  <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Skybox ({form.selectedSkyboxes.length})
                  </p>
                  {form.selectedSkyboxes.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {form.selectedSkyboxes.map(id => (
                        <span
                          key={id}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium cursor-pointer"
                          style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                          onClick={() => toggleSkybox(id)}
                          title="Kliknutím odeberete"
                        >
                          {id} <X size={10} />
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>Žádný skybox</p>
                  )}
                </div>

                {/* Selected club seats as individual KS badges */}
                <div>
                  <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                    Klubová místa ({selectedSections.reduce((n, s) => n + (form.clubSeatMap[s]?.length || 0), 0)} sed.)
                  </p>
                  {selectedSections.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {selectedSections.flatMap(sectionId =>
                        (form.clubSeatMap[sectionId] || []).map(seatKey => (
                          <span
                            key={`${sectionId}-${seatKey}`}
                            className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-xs font-medium cursor-pointer"
                            style={{ backgroundColor: 'var(--color-primary)', color: '#fff' }}
                            onClick={() => removeSeat(sectionId, seatKey)}
                            title="Kliknutím odeberete"
                          >
                            KS-{sectionId}-{seatKey} <X size={9} />
                          </span>
                        ))
                      )}
                    </div>
                  ) : (
                    <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>Žádná sedadla</p>
                  )}
                </div>
              </div>
            </div>
          </Section>
          )}

          {/* Section 5: Allocation types */}
          <Section title="Typy alokace">
            {errors.allocTypes && (
              <p className="text-xs text-red-500 -mt-2">{errors.allocTypes}</p>
            )}

            {/* TYPE1 — real checkbox */}
            <label
              className="flex items-start gap-3 p-3 rounded-lg cursor-pointer"
              style={{
                backgroundColor: form.allocType1 ? 'var(--color-primary)' + '10' : 'var(--color-surface-2)',
                border: '1px solid var(--color-border)',
              }}
            >
              <input
                type="checkbox"
                checked={form.allocType1}
                onChange={e => {
                  const checked = e.target.checked
                  setForm(f => ({
                    ...f,
                    allocType1: checked,
                    // Clear seats when TYPE1 is disabled
                    ...(checked ? {} : { selectedSkyboxes: [], clubSeatMap: {} }),
                  }))
                  if (!checked) setZoomedSection(null)
                }}
                className="mt-0.5"
                style={{ accentColor: 'var(--color-primary)' }}
              />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  TYPE1 — Smluvní místa
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  Skybox nebo klubová sekce sjednaná ve smlouvě. Po zaškrtnutí se zobrazí mapa arény pro výběr míst.
                </p>
              </div>
            </label>

            {/* Other allocation types */}
            {ALLOC_TYPE_OPTIONS.map(opt => {
              const isChecked = form[`allocType${opt.key.slice(-1) === '2' ? '2' : '3'}`]
              const formKey = opt.key === 'TYPE2' ? 'allocType2' : 'allocType3'
              return (
                <div key={opt.key}>
                  <label
                    className="flex items-start gap-3 p-3 rounded-lg cursor-pointer"
                    style={{
                      backgroundColor: isChecked ? 'var(--color-primary)' + '10' : 'var(--color-surface-2)',
                      border: '1px solid var(--color-border)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={e => setForm(f => ({ ...f, [formKey]: e.target.checked }))}
                      className="mt-0.5"
                      style={{ accentColor: 'var(--color-primary)' }}
                    />
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {opt.key} — {opt.label}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                        {opt.description}
                      </p>
                      {/* Extra field (e.g. budget for TYPE2) */}
                      {opt.extra && isChecked && (
                        <div className="mt-3">
                          <Field label={opt.extra.label}>
                            <Input
                              value={form[opt.extra.field]}
                              onChange={set(opt.extra.field)}
                              placeholder={opt.extra.placeholder}
                            />
                            {err(opt.extra.field)}
                          </Field>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              )
            })}
          </Section>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('/admin-clients/clients')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm transition-colors"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            >
              <X size={15} />
              Zrušit
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-60"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-fg)' }}
            >
              <Save size={15} />
              {saving ? 'Ukládám…' : isNew ? 'Vytvořit partnera' : 'Uložit změny'}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}
