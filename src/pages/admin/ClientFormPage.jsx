import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Save, X, CheckSquare } from 'lucide-react'
import { useAdmin } from '@/context/AdminContext'
import { SKYBOXES, CLUB_SECTIONS } from '@/lib/mockData'

// ── Arena Seat Picker (admin mode — all sections selectable) ──────────────────
const W = 800, H = 640
const CX = W / 2, CY = H / 2
const RX_OUTER = 340, RY_OUTER = 270
const RX_INNER = 200, RY_INNER = 155

const SKYBOX_SECTION_MAP = { 'SB-05': 5, 'SB-08': 8, 'SB-09': 9 }
const ALL_SKYBOX_IDS = Object.keys(SKYBOXES)
const ALL_CLUB_IDS = Object.keys(CLUB_SECTIONS)

function AdminArenaMap({ selectedSkyboxes, selectedSections, onToggleSkybox, onToggleSection }) {
  const elements = []

  // Upper ring (3xx) — skyboxes live here
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

    // Check if any skybox maps to this index
    const sbId = ALL_SKYBOX_IDS.find(id => SKYBOX_SECTION_MAP[id] === i + 1)
    const isSelected = sbId && selectedSkyboxes.includes(sbId)

    elements.push(
      <g
        key={`u-${i}`}
        onClick={sbId ? () => onToggleSkybox(sbId) : undefined}
        style={{ cursor: sbId ? 'pointer' : 'default' }}
      >
        <path
          d={path}
          fill={isSelected ? 'var(--color-primary)' : sbId ? 'var(--color-primary-light)' : 'var(--color-border)'}
          fillOpacity={isSelected ? 0.9 : sbId ? 0.3 : 0.4}
          stroke="var(--color-surface)"
          strokeWidth="1.5"
        />
        {sbId && (
          <text
            x={lx} y={ly}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={isSelected ? 9 : 8}
            fontWeight="600"
            fill={isSelected ? '#fff' : 'var(--color-primary)'}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {sbId}
          </text>
        )}
      </g>
    )
  }

  // Club ring (2xx) — club sections live here
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

    const sectionId = String(200 + i + 1)
    const isKnown = ALL_CLUB_IDS.includes(sectionId)
    const isSelected = isKnown && selectedSections.includes(sectionId)

    elements.push(
      <g
        key={`c-${i}`}
        onClick={isKnown ? () => onToggleSection(sectionId) : undefined}
        style={{ cursor: isKnown ? 'pointer' : 'default' }}
      >
        <path
          d={path}
          fill={isSelected ? 'var(--color-primary)' : isKnown ? 'var(--color-primary-light)' : 'var(--color-border)'}
          fillOpacity={isSelected ? 0.9 : isKnown ? 0.3 : 0.35}
          stroke="var(--color-surface)"
          strokeWidth="1.5"
        />
        {isKnown && (
          <text
            x={lx} y={ly}
            textAnchor="middle" dominantBaseline="middle"
            fontSize={isSelected ? 8 : 7}
            fontWeight="600"
            fill={isSelected ? '#fff' : 'var(--color-primary)'}
            style={{ pointerEvents: 'none', userSelect: 'none' }}
          >
            {sectionId}
          </text>
        )}
      </g>
    )
  }

  // Floor ring (1xx) — display only
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

  // Ice / pitch
  elements.push(
    <ellipse
      key="ice"
      cx={CX} cy={CY}
      rx={RX_INNER - 10} ry={RY_INNER - 8}
      fill="var(--color-surface-2)"
      stroke="var(--color-border)"
      strokeWidth="1.5"
    />
  )
  elements.push(
    <text key="ice-label" x={CX} y={CY} textAnchor="middle" dominantBaseline="middle" fontSize={13} fontWeight="600" fill="var(--color-text-subtle)" style={{ userSelect: 'none' }}>
      {' '}
    </text>
  )

  return (
    <div className="w-full" style={{ maxWidth: 540 }}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        {elements}
      </svg>
    </div>
  )
}

// ── Form Field ────────────────────────────────────────────────────────────────
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

// ── Main Page ─────────────────────────────────────────────────────────────────
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
    selectedSections: [],
  })
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (existing) {
      setForm({
        companyName: existing.companyName || '',
        ico: existing.ico || '',
        address: existing.address || '',
        contactFirstName: existing.contactPerson?.firstName || '',
        contactLastName: existing.contactPerson?.lastName || '',
        contactEmail: existing.contactPerson?.email || '',
        contractFrom: existing.contract?.validFrom || '',
        contractTo: existing.contract?.validTo || '',
        contractAmount: existing.contract?.amountCZK ? String(existing.contract.amountCZK) : '',
        selectedSkyboxes: existing.seats?.skyboxes || [],
        selectedSections: existing.seats?.clubSections || [],
      })
    }
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }))

  const toggleSkybox = (id) => {
    setForm(f => ({
      ...f,
      selectedSkyboxes: f.selectedSkyboxes.includes(id)
        ? f.selectedSkyboxes.filter(s => s !== id)
        : [...f.selectedSkyboxes, id],
    }))
  }

  const toggleSection = (id) => {
    setForm(f => ({
      ...f,
      selectedSections: f.selectedSections.includes(id)
        ? f.selectedSections.filter(s => s !== id)
        : [...f.selectedSections, id],
    }))
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
    return e
  }

  const handleSave = async (e) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length) { setErrors(errs); return }
    setErrors({})
    setSaving(true)
    await new Promise(r => setTimeout(r, 400))

    const data = {
      brandId: activeBrand?.key || 'o2arena',
      companyName: form.companyName.trim(),
      ico: form.ico.trim(),
      address: form.address.trim(),
      contactPerson: {
        firstName: form.contactFirstName.trim(),
        lastName: form.contactLastName.trim(),
        email: form.contactEmail.trim(),
      },
      contract: {
        id: existing?.contract?.id || `VIP-${Date.now()}`,
        validFrom: form.contractFrom,
        validTo: form.contractTo,
        amountCZK: Number(form.contractAmount),
        ...(existing?.contract || {}),
      },
      seats: {
        skyboxes: form.selectedSkyboxes,
        clubSections: form.selectedSections,
      },
      // Keep B2B SPA fields
      type1Allocation: (form.selectedSkyboxes.length || form.selectedSections.length)
        ? { skyboxes: form.selectedSkyboxes, clubSections: form.selectedSections }
        : existing?.type1Allocation || null,
      allocationKinds: existing?.allocationKinds || [],
      benefitBudgetCZK: existing?.benefitBudgetCZK || 0,
      spentBenefitCZK: existing?.spentBenefitCZK || 0,
    }

    if (isNew) {
      addPartner({ ...data, id: `partner-${Date.now()}`, userId: null })
    } else {
      updatePartner(existing.id, data)
    }

    navigate('/admin-clients/clients')
  }

  const err = (key) => errors[key] ? (
    <p className="text-xs mt-1 text-red-500">{errors[key]}</p>
  ) : null

  const allSelected = [...form.selectedSkyboxes, ...form.selectedSections.map(s => `Sek. ${s}`)]

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
        style={{ backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', border: '1px solid var(--color-border)', borderBottomWidth: 0 }}
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
                <Field label="E-mail (budoucí přihlášení do B2B portálu)" required>
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

          {/* Section 4: Seats */}
          <Section title="Přidělená místa">
            <div className="flex gap-6">
              {/* Arena map */}
              <div className="flex-1 min-w-0">
                <p className="text-xs mb-3" style={{ color: 'var(--color-text-subtle)' }}>
                  Kliknutím na zvýrazněné sekce přiřaďte partnerovi skybox nebo sekci hlediště.
                </p>
                <AdminArenaMap
                  selectedSkyboxes={form.selectedSkyboxes}
                  selectedSections={form.selectedSections}
                  onToggleSkybox={toggleSkybox}
                  onToggleSection={toggleSection}
                />
              </div>

              {/* Selection summary */}
              <div className="w-52 shrink-0">
                <p className="text-xs font-medium mb-2" style={{ color: 'var(--color-text)' }}>Přiřazená místa</p>

                {/* Skyboxes */}
                <div className="mb-3">
                  <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-subtle)' }}>Skybox</p>
                  <div className="space-y-1">
                    {ALL_SKYBOX_IDS.map(id => (
                      <label key={id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.selectedSkyboxes.includes(id)}
                          onChange={() => toggleSkybox(id)}
                          className="rounded"
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        <span className="text-xs" style={{ color: 'var(--color-text)' }}>
                          {SKYBOXES[id].label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Club sections */}
                <div>
                  <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-subtle)' }}>Sekce hlediště</p>
                  <div className="space-y-1">
                    {ALL_CLUB_IDS.map(id => (
                      <label key={id} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={form.selectedSections.includes(id)}
                          onChange={() => toggleSection(id)}
                          className="rounded"
                          style={{ accentColor: 'var(--color-primary)' }}
                        />
                        <span className="text-xs" style={{ color: 'var(--color-text)' }}>
                          {CLUB_SECTIONS[id].label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Summary chips */}
                {allSelected.length > 0 && (
                  <div className="mt-3 pt-3" style={{ borderTop: '1px solid var(--color-border)' }}>
                    <p className="text-xs mb-1.5" style={{ color: 'var(--color-text-subtle)' }}>Vybráno:</p>
                    <div className="flex flex-wrap gap-1">
                      {allSelected.map(s => (
                        <span
                          key={s}
                          className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium"
                          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-fg)' }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
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
