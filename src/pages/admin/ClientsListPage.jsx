import { useState, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Plus, Pencil, Trash2, Upload, X, AlertTriangle, ChevronUp, ChevronDown, FileDown } from 'lucide-react'
import { useAdmin } from '@/context/AdminContext'
import clsx from 'clsx'

const CONTRACT_FILTERS = [
  { value: 'all', label: 'Všechny' },
  { value: 'active', label: 'Aktivní' },
  { value: 'expiring', label: 'Končí do 90 dnů' },
  { value: 'expired', label: 'Prošlé' },
]

const CSV_COLUMNS = ['name', 'ico', 'address', 'contactFirstName', 'contactLastName', 'contactEmail', 'contractFrom', 'contractTo', 'contractAmount', 'seats']

function formatAmount(n) {
  return n ? Number(n).toLocaleString('cs-CZ') + ' Kč' : '—'
}

function contractStatus(validTo) {
  if (!validTo) return 'unknown'
  const diff = (new Date(validTo) - new Date()) / (1000 * 60 * 60 * 24)
  if (diff < 0) return 'expired'
  if (diff <= 90) return 'expiring'
  return 'active'
}

function StatusPill({ validTo }) {
  const status = contractStatus(validTo)
  const map = {
    active:   { label: 'Aktivní',     cls: 'bg-green-100 text-green-800' },
    expiring: { label: 'Končí brzy',  cls: 'bg-amber-100 text-amber-800' },
    expired:  { label: 'Prošlé',      cls: 'bg-red-100 text-red-800' },
    unknown:  { label: '—',           cls: 'bg-gray-100 text-gray-500' },
  }
  const { label, cls } = map[status]
  return (
    <span className={clsx('inline-flex items-center px-2 py-0.5 rounded text-xs font-medium', cls)}>
      {label}
    </span>
  )
}

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ChevronUp size={12} className="opacity-20" />
  return sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
}

// ── CSV Import Modal ──────────────────────────────────────────────────────────
function CsvImportModal({ onClose, onImport, existingPartners }) {
  const [rows, setRows] = useState(null)
  const [parseError, setParseError] = useState('')
  const fileRef = useRef()

  const parseCSV = (text) => {
    const lines = text.trim().split('\n').filter(Boolean)
    if (lines.length < 2) return { error: 'CSV musí obsahovat hlavičku a alespoň jeden záznam.' }

    const header = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    const missing = CSV_COLUMNS.filter(c => !header.includes(c))
    if (missing.length) return { error: `Chybějící sloupce: ${missing.join(', ')}` }

    const parsed = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      return Object.fromEntries(header.map((h, i) => [h, vals[i] || '']))
    })

    // Flag potential duplicates
    const flagged = parsed.map(row => {
      const reasons = []
      existingPartners.forEach(p => {
        if (row.ico && p.ico === row.ico) reasons.push('IČO')
        if (row.name && p.companyName?.toLowerCase() === row.name.toLowerCase()) reasons.push('název')
        const cp = p.contactPerson
        if (cp && row.contactFirstName && row.contactLastName &&
            cp.firstName?.toLowerCase() === row.contactFirstName.toLowerCase() &&
            cp.lastName?.toLowerCase() === row.contactLastName.toLowerCase()) {
          reasons.push('kontaktní osoba')
        }
      })
      return { ...row, _duplicate: reasons.length > 0, _dupReasons: reasons }
    })

    return { rows: flagged }
  }

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const { rows, error } = parseCSV(ev.target.result)
      if (error) { setParseError(error); setRows(null) }
      else { setRows(rows); setParseError('') }
    }
    reader.readAsText(file, 'utf-8')
  }

  const handleImport = () => {
    const toImport = rows.filter(r => !r._skip)
    onImport(toImport)
    onClose()
  }

  const toggleSkip = (i) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, _skip: !r._skip } : r))
  }

  const dupCount = rows?.filter(r => r._duplicate && !r._skip).length ?? 0
  const importCount = rows?.filter(r => !r._skip).length ?? 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div
        className="w-full max-w-3xl rounded-xl shadow-2xl flex flex-col max-h-[85vh]"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>Import partnerů z CSV</h2>
          <button onClick={onClose} style={{ color: 'var(--color-text-subtle)' }}>
            <X size={18} />
          </button>
        </div>

        <div className="p-5 overflow-auto flex-1">
          {/* Upload zone */}
          {!rows && (
            <div>
              <div
                className="border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors"
                style={{ borderColor: 'var(--color-border)' }}
                onClick={() => fileRef.current?.click()}
                onDragOver={e => e.preventDefault()}
                onDrop={e => {
                  e.preventDefault()
                  const f = e.dataTransfer.files[0]
                  if (f) { fileRef.current.files = e.dataTransfer.files; handleFile({ target: { files: [f] } }) }
                }}
              >
                <Upload size={28} className="mx-auto mb-3" style={{ color: 'var(--color-text-subtle)' }} />
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>Přetáhněte CSV nebo klikněte pro výběr</p>
                <p className="text-xs mt-1" style={{ color: 'var(--color-text-subtle)' }}>Formát UTF-8, oddělovač čárka</p>
                <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden" onChange={handleFile} />
              </div>

              {parseError && (
                <div className="mt-3 flex items-start gap-2 p-3 rounded-lg" style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
                  <AlertTriangle size={15} className="shrink-0 mt-0.5 text-red-600" />
                  <p className="text-xs text-red-700">{parseError}</p>
                </div>
              )}

              {/* Column reference */}
              <div className="mt-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}>
                <p className="text-xs font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>Požadované sloupce (v pořadí):</p>
                <div className="flex flex-wrap gap-1.5">
                  {CSV_COLUMNS.map(c => (
                    <code key={c} className="text-xs px-2 py-0.5 rounded" style={{ backgroundColor: 'var(--color-border)', color: 'var(--color-text)' }}>
                      {c}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Preview table */}
          {rows && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm" style={{ color: 'var(--color-text)' }}>
                  <span className="font-semibold">{rows.length}</span> záznamů nalezeno
                  {dupCount > 0 && (
                    <span className="ml-2 text-amber-600 font-medium">· {dupCount} možných duplicit</span>
                  )}
                </p>
                <button
                  onClick={() => { setRows(null); setParseError('') }}
                  className="text-xs underline"
                  style={{ color: 'var(--color-text-subtle)' }}
                >
                  Nahrát jiný soubor
                </button>
              </div>

              <div className="overflow-auto rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
                <table className="w-full text-xs min-w-[640px]">
                  <thead>
                    <tr style={{ backgroundColor: 'var(--color-surface-2)' }}>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: 'var(--color-text-subtle)' }}>Název</th>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: 'var(--color-text-subtle)' }}>IČO</th>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: 'var(--color-text-subtle)' }}>Kontakt</th>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: 'var(--color-text-subtle)' }}>Platnost</th>
                      <th className="px-3 py-2 text-left font-medium" style={{ color: 'var(--color-text-subtle)' }}>Stav</th>
                      <th className="px-3 py-2" />
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((row, i) => (
                      <tr
                        key={i}
                        style={{
                          backgroundColor: row._skip
                            ? 'var(--color-surface-2)'
                            : row._duplicate
                            ? '#fffbeb'
                            : 'var(--color-surface)',
                          opacity: row._skip ? 0.4 : 1,
                          borderTop: '1px solid var(--color-border)',
                        }}
                      >
                        <td className="px-3 py-2 font-medium" style={{ color: 'var(--color-text)' }}>{row.name}</td>
                        <td className="px-3 py-2" style={{ color: 'var(--color-text-muted)' }}>{row.ico || '—'}</td>
                        <td className="px-3 py-2" style={{ color: 'var(--color-text-muted)' }}>
                          {row.contactFirstName} {row.contactLastName}
                        </td>
                        <td className="px-3 py-2" style={{ color: 'var(--color-text-muted)' }}>
                          {row.contractFrom} – {row.contractTo}
                        </td>
                        <td className="px-3 py-2">
                          {row._duplicate && !row._skip && (
                            <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
                              <AlertTriangle size={11} />
                              Duplicita ({row._dupReasons.join(', ')})
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button
                            onClick={() => toggleSkip(i)}
                            className="text-xs underline"
                            style={{ color: row._skip ? 'var(--color-primary)' : 'var(--color-text-subtle)' }}
                          >
                            {row._skip ? 'Přidat' : 'Přeskočit'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {rows && (
          <div
            className="flex items-center justify-between px-5 py-3 shrink-0"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>
              Bude importováno: <span className="font-semibold" style={{ color: 'var(--color-text)' }}>{importCount}</span> záznamů
            </p>
            <div className="flex gap-2">
              <button
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-sm transition-colors"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              >
                Zrušit
              </button>
              <button
                onClick={handleImport}
                disabled={importCount === 0}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
                style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-fg)' }}
              >
                Importovat {importCount} partnerů
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function ClientsListPage() {
  const { partners, activeBrand, addPartner, deletePartner } = useAdmin()
  const navigate = useNavigate()

  const [search, setSearch] = useState('')
  const [contractFilter, setContractFilter] = useState('all')
  const [sortField, setSortField] = useState('companyName')
  const [sortDir, setSortDir] = useState('asc')
  const [showImport, setShowImport] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  // Filter to active brand
  const brandPartners = useMemo(
    () => partners.filter(p => p.brandId === activeBrand?.key),
    [partners, activeBrand]
  )

  const filtered = useMemo(() => {
    let list = brandPartners

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        p.companyName?.toLowerCase().includes(q) ||
        p.ico?.includes(q)
      )
    }

    if (contractFilter !== 'all') {
      list = list.filter(p => contractStatus(p.contract?.validTo) === contractFilter)
    }

    list = [...list].sort((a, b) => {
      let va, vb
      if (sortField === 'companyName') { va = a.companyName || ''; vb = b.companyName || '' }
      else if (sortField === 'validTo') { va = a.contract?.validTo || ''; vb = b.contract?.validTo || '' }
      else if (sortField === 'amount') { va = a.contract?.amountCZK || 0; vb = b.contract?.amountCZK || 0 }
      else { va = ''; vb = '' }
      if (va < vb) return sortDir === 'asc' ? -1 : 1
      if (va > vb) return sortDir === 'asc' ? 1 : -1
      return 0
    })

    return list
  }, [brandPartners, search, contractFilter, sortField, sortDir])

  const handleSort = (field) => {
    if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
  }

  const handleImport = (rows) => {
    rows.forEach((row, i) => {
      const seats = row.seats ? row.seats.split(';').map(s => s.trim()).filter(Boolean) : []
      const skyboxes = seats.filter(s => s.startsWith('SB-'))
      const clubSections = seats.filter(s => !s.startsWith('SB-'))
      addPartner({
        id: `imported-${Date.now()}-${i}`,
        brandId: activeBrand.key,
        companyName: row.name,
        ico: row.ico || '',
        address: row.address || '',
        contactPerson: {
          firstName: row.contactFirstName,
          lastName: row.contactLastName,
          email: row.contactEmail,
        },
        contract: {
          id: `IMP-${Date.now()}-${i}`,
          validFrom: row.contractFrom,
          validTo: row.contractTo,
          amountCZK: Number(row.contractAmount) || 0,
        },
        seats: { skyboxes, clubSections },
        allocationKinds: [],
        type1Allocation: null,
        benefitBudgetCZK: 0,
        spentBenefitCZK: 0,
      })
    })
  }

  const handleDelete = (id) => {
    deletePartner(id)
    setDeleteConfirm(null)
  }

  const thStyle = (field) => ({
    cursor: 'pointer',
    userSelect: 'none',
    color: 'var(--color-text-subtle)',
  })

  return (
    <div>
      {/* Page header + breadcrumb */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-xs mb-0.5" style={{ color: 'var(--color-text-subtle)' }}>
            Domů › Partneři
          </p>
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            Seznam partnerů — {activeBrand?.shortName}
          </h1>
        </div>
        <button
          onClick={() => navigate('/admin-clients/clients/new')}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-fg)' }}
        >
          <Plus size={16} />
          Nový partner
        </button>
      </div>

      {/* Card */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        {/* Tabs */}
        <div className="flex items-center gap-0" style={{ borderBottom: '1px solid var(--color-border)' }}>
          <button
            className="px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
            style={{ borderBottomColor: 'var(--color-primary)', color: 'var(--color-primary)' }}
          >
            Seznam
          </button>
          <button
            onClick={() => navigate('/admin-clients/clients/new')}
            className="px-5 py-3 text-sm font-medium border-b-2 -mb-px transition-colors"
            style={{ borderBottomColor: 'transparent', color: 'var(--color-text-muted)' }}
          >
            Nový záznam
          </button>
        </div>

        {/* Filters */}
        <div
          className="flex flex-wrap items-center gap-3 px-5 py-3"
          style={{ backgroundColor: 'var(--color-surface-2)', borderBottom: '1px solid var(--color-border)' }}
        >
          <div className="relative flex-1 min-w-48">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--color-text-subtle)' }} />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Hledat podle názvu nebo IČO…"
              className="w-full pl-9 pr-3 py-2 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: 'var(--color-surface)',
                border: '1px solid var(--color-border)',
                color: 'var(--color-text)',
              }}
            />
          </div>

          <select
            value={contractFilter}
            onChange={e => setContractFilter(e.target.value)}
            className="px-3 py-2 rounded-lg text-sm outline-none"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text)',
            }}
          >
            {CONTRACT_FILTERS.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setShowImport(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            >
              <Upload size={14} />
              Import CSV
            </button>
            <button
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-colors"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
            >
              <FileDown size={14} />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-border)' }}>
                <th
                  className="px-5 py-3 text-left text-xs font-semibold"
                  style={thStyle('companyName')}
                  onClick={() => handleSort('companyName')}
                >
                  <span className="flex items-center gap-1">
                    Název partnera
                    <SortIcon field="companyName" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold" style={{ color: 'var(--color-text-subtle)' }}>
                  IČO
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold" style={{ color: 'var(--color-text-subtle)' }}>
                  Kontaktní osoba
                </th>
                <th
                  className="px-3 py-3 text-left text-xs font-semibold"
                  style={thStyle('validTo')}
                  onClick={() => handleSort('validTo')}
                >
                  <span className="flex items-center gap-1">
                    Platnost smlouvy
                    <SortIcon field="validTo" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
                <th
                  className="px-3 py-3 text-left text-xs font-semibold"
                  style={thStyle('amount')}
                  onClick={() => handleSort('amount')}
                >
                  <span className="flex items-center gap-1">
                    Částka
                    <SortIcon field="amount" sortField={sortField} sortDir={sortDir} />
                  </span>
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold" style={{ color: 'var(--color-text-subtle)' }}>
                  Místa
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold" style={{ color: 'var(--color-text-subtle)' }}>
                  Stav
                </th>
                <th className="px-3 py-3" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-sm" style={{ color: 'var(--color-text-subtle)' }}>
                    {search || contractFilter !== 'all'
                      ? 'Žádné výsledky pro zadaný filtr.'
                      : 'Zatím žádní partneři. Přidejte prvního kliknutím na „Nový partner".'}
                  </td>
                </tr>
              ) : (
                filtered.map(partner => {
                  const cp = partner.contactPerson
                  const seats = partner.seats
                  const allSeats = [
                    ...(seats?.skyboxes || []),
                    ...(seats?.clubSections || []).map(s => `Sek. ${s}`),
                  ]
                  return (
                    <tr
                      key={partner.id}
                      style={{ borderTop: '1px solid var(--color-border)' }}
                      className="group hover:bg-black/[0.02] transition-colors"
                    >
                      <td className="px-5 py-3">
                        <button
                          onClick={() => navigate(`/admin-clients/clients/${partner.id}`)}
                          className="font-medium text-left hover:underline"
                          style={{ color: 'var(--color-primary)' }}
                        >
                          {partner.companyName}
                        </button>
                        {partner.address && (
                          <div className="text-xs truncate max-w-[200px]" style={{ color: 'var(--color-text-subtle)' }}>
                            {partner.address}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {partner.ico || '—'}
                      </td>
                      <td className="px-3 py-3">
                        {cp ? (
                          <div>
                            <div className="text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                              {cp.firstName} {cp.lastName}
                            </div>
                            <div className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>{cp.email}</div>
                          </div>
                        ) : <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>—</span>}
                      </td>
                      <td className="px-3 py-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {partner.contract?.validFrom} – {partner.contract?.validTo}
                      </td>
                      <td className="px-3 py-3 text-xs font-medium" style={{ color: 'var(--color-text)' }}>
                        {formatAmount(partner.contract?.amountCZK)}
                      </td>
                      <td className="px-3 py-3">
                        {allSeats.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {allSeats.map(s => (
                              <span
                                key={s}
                                className="inline-block px-1.5 py-0.5 rounded text-xs"
                                style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text-muted)' }}
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        ) : <span className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>—</span>}
                      </td>
                      <td className="px-3 py-3">
                        <StatusPill validTo={partner.contract?.validTo} />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => navigate(`/admin-clients/clients/${partner.id}`)}
                            className="p-1.5 rounded-md hover:bg-black/5 transition-colors"
                            style={{ color: 'var(--color-text-muted)' }}
                            title="Upravit"
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(partner)}
                            className="p-1.5 rounded-md hover:bg-red-50 transition-colors"
                            style={{ color: 'var(--color-text-muted)' }}
                            title="Smazat"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-5 py-3 text-xs"
          style={{ borderTop: '1px solid var(--color-border)', color: 'var(--color-text-subtle)' }}
        >
          <span>Záznamy 1 až {filtered.length} z celkem {brandPartners.length}</span>
        </div>
      </div>

      {/* Delete confirm dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}>
          <div
            className="w-full max-w-sm rounded-xl p-6 shadow-xl"
            style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
          >
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text)' }}>Smazat partnera?</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--color-text-muted)' }}>
              Opravdu chcete smazat partnera <strong>{deleteConfirm.companyName}</strong>? Tato akce je nevratná.
            </p>
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg text-sm"
                style={{ border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
              >
                Zrušit
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm.id)}
                className="px-4 py-2 rounded-lg text-sm font-medium"
                style={{ backgroundColor: '#dc2626', color: '#fff' }}
              >
                Smazat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV Import modal */}
      {showImport && (
        <CsvImportModal
          onClose={() => setShowImport(false)}
          onImport={handleImport}
          existingPartners={brandPartners}
        />
      )}
    </div>
  )
}
