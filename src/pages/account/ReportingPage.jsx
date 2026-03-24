import { useEffect, useState } from 'react'
import { BarChart2, Calendar } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getReporting } from '@/lib/mockData'
import AccountTabNav from '@/components/account/AccountTabNav'

function formatDate(d) {
  return new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

function UtilBar({ value, total, color }) {
  if (total === 0) return <span style={{ color: 'var(--color-text-muted)' }}>—</span>
  const pct = Math.round((value / total) * 100)
  if (pct === 0) {
    return <span className="text-xs font-medium tabular-nums" style={{ color: '#dc2626' }}>0 %</span>
  }
  return (
    <div className="flex items-center gap-2">
      <div
        className="flex-1 h-1.5 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface-2)', minWidth: 48 }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-xs tabular-nums w-8 text-right" style={{ color }}>
        {pct}%
      </span>
    </div>
  )
}

function StackedChart({ rows }) {
  const chartRows = rows.filter(r => r.allocated > 0)
  if (chartRows.length === 0) return null

  return (
    <div className="card rounded-xl p-4 mb-6">
      <div className="text-xs font-semibold mb-4 uppercase tracking-wide" style={{ color: 'var(--color-text-muted)' }}>
        Přehled čerpání dle akce
      </div>
      <div className="space-y-3">
        {chartRows.map((row, i) => {
          const total = row.allocated
          const utilized = row.claimed + row.auto
          const pct = Math.round((utilized / total) * 100)
          const barColor = pct >= 80 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626'
          const shortName = row.eventName.length > 22
            ? row.eventName.slice(0, 20) + '…'
            : row.eventName

          return (
            <div key={i} className="flex items-center gap-3">
              <div
                className="text-xs text-right shrink-0 truncate"
                style={{ color: 'var(--color-text-muted)', width: 110 }}
                title={row.eventName}
              >
                {shortName}
              </div>
              <div
                className="flex-1 h-4 rounded-full overflow-hidden flex"
                style={{ backgroundColor: 'var(--color-surface-2)' }}
              >
                {row.claimed > 0 && (
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${(row.claimed / total) * 100}%`, backgroundColor: '#2563eb' }}
                    title={`Čerpáno: ${row.claimed}`}
                  />
                )}
                {row.auto > 0 && (
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${(row.auto / total) * 100}%`, backgroundColor: '#7c3aed' }}
                    title={`Auto: ${row.auto}`}
                  />
                )}
                {row.released > 0 && (
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${(row.released / total) * 100}%`, backgroundColor: '#d97706' }}
                    title={`Uvolněno: ${row.released}`}
                  />
                )}
                {row.lapsed > 0 && (
                  <div
                    className="h-full transition-all duration-500"
                    style={{ width: `${(row.lapsed / total) * 100}%`, backgroundColor: '#dc2626' }}
                    title={`Propadlo: ${row.lapsed}`}
                  />
                )}
              </div>
              <div
                className="text-xs tabular-nums text-right shrink-0"
                style={{ width: 32, color: barColor }}
              >
                {pct}%
              </div>
            </div>
          )
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t text-xs" style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}>
        {[
          { color: '#2563eb', label: 'Čerpáno' },
          { color: '#7c3aed', label: 'Auto' },
          { color: '#d97706', label: 'Uvolněno' },
          { color: '#dc2626', label: 'Propadlo' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
            {label}
          </div>
        ))}
      </div>
    </div>
  )
}

export default function ReportingPage() {
  const { currentPartner } = useApp()
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentPartner) return
    getReporting(currentPartner.id).then(data => {
      setRows(data)
      setLoading(false)
    })
  }, [currentPartner])

  const totals = rows.reduce((acc, r) => ({
    allocated: acc.allocated + r.allocated,
    claimed: acc.claimed + r.claimed,
    auto: acc.auto + r.auto,
    released: acc.released + r.released,
    lapsed: acc.lapsed + r.lapsed,
  }), { allocated: 0, claimed: 0, auto: 0, released: 0, lapsed: 0 })

  const overallUtil = totals.allocated > 0
    ? Math.round(((totals.claimed + totals.auto) / totals.allocated) * 100)
    : null

  return (
    <div className="animate-fade-in max-w-4xl">
      <AccountTabNav />

      <h1 className="text-xl font-bold mb-5" style={{ color: 'var(--color-text)' }}>
        Přehled utilizace
      </h1>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          <div className="h-24 rounded-xl" style={{ backgroundColor: 'var(--color-surface-2)' }} />
          <div className="h-48 rounded-xl" style={{ backgroundColor: 'var(--color-surface-2)' }} />
        </div>
      ) : rows.length === 0 ? (
        <div className="card rounded-xl p-12 text-center">
          <BarChart2 size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-medium" style={{ color: 'var(--color-text-muted)' }}>Žádná data k zobrazení</p>
        </div>
      ) : (
        <>
          {/* Summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="card rounded-xl p-4">
              <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Celkem alokováno</div>
              <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>{totals.allocated}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>míst / vstupenek</div>
            </div>
            <div className="card rounded-xl p-4">
              <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Čerpáno (aktivně)</div>
              <div className="text-2xl font-bold" style={{ color: '#2563eb' }}>{totals.claimed}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>potvrzeno partnerem</div>
            </div>
            <div className="card rounded-xl p-4">
              <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Auto-přiřazeno</div>
              <div className="text-2xl font-bold" style={{ color: '#7c3aed' }}>{totals.auto}</div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>TYPE3 benefit</div>
            </div>
            <div className="card rounded-xl p-4">
              <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>Celková utilizace</div>
              <div
                className="text-2xl font-bold"
                style={{ color: overallUtil === null ? 'var(--color-text-muted)' : overallUtil >= 80 ? '#059669' : overallUtil >= 50 ? '#d97706' : '#dc2626' }}
              >
                {overallUtil !== null ? `${overallUtil} %` : '—'}
              </div>
              <div className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                propad: {totals.lapsed} míst
              </div>
            </div>
          </div>

          {/* Stacked bar chart */}
          <StackedChart rows={rows} />

          {/* Table */}
          <div className="card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}>
                    {[
                      { key: 'event', label: 'Akce', align: 'left' },
                      { key: 'allocated', label: 'Alok.', align: 'center' },
                      { key: 'claimed', label: 'Čerpáno', align: 'center' },
                      { key: 'auto', label: 'Auto', align: 'center' },
                      { key: 'released', label: 'Uvolněno', align: 'center' },
                      { key: 'lapsed', label: 'Propadlo', align: 'center' },
                      { key: 'util', label: 'Utilizace', align: 'left' },
                    ].map(col => (
                      <th
                        key={col.key}
                        className={`px-4 py-2.5 text-xs font-semibold text-${col.align}`}
                        style={{ color: 'var(--color-text-muted)' }}
                      >
                        {col.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const utilized = row.claimed + row.auto
                    const pct = row.allocated > 0 ? Math.round((utilized / row.allocated) * 100) : null
                    const barColor = pct === null ? '#6b7280' : pct >= 80 ? '#059669' : pct >= 50 ? '#d97706' : '#dc2626'
                    return (
                      <tr
                        key={i}
                        style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--color-border)' : 'none' }}
                      >
                        <td className="px-4 py-3">
                          <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                            {row.eventName}
                          </div>
                          <div className="flex items-center gap-1 text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                            <Calendar size={11} />
                            {formatDate(row.eventDate)}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-semibold" style={{ color: 'var(--color-text)' }}>
                            {row.allocated}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium" style={{ color: '#2563eb' }}>{row.claimed}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium" style={{ color: '#7c3aed' }}>{row.auto}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium" style={{ color: '#d97706' }}>{row.released}</span>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-medium" style={{ color: row.lapsed > 0 ? '#dc2626' : 'var(--color-text-muted)' }}>
                            {row.lapsed}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <UtilBar value={utilized} total={row.allocated} color={barColor} />
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ borderTop: '2px solid var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}>
                    <td className="px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>
                      Celkem
                    </td>
                    <td className="px-4 py-2.5 text-center text-sm font-bold" style={{ color: 'var(--color-text)' }}>
                      {totals.allocated}
                    </td>
                    <td className="px-4 py-2.5 text-center text-sm font-bold" style={{ color: '#2563eb' }}>
                      {totals.claimed}
                    </td>
                    <td className="px-4 py-2.5 text-center text-sm font-bold" style={{ color: '#7c3aed' }}>
                      {totals.auto}
                    </td>
                    <td className="px-4 py-2.5 text-center text-sm font-bold" style={{ color: '#d97706' }}>
                      {totals.released}
                    </td>
                    <td className="px-4 py-2.5 text-center text-sm font-bold" style={{ color: '#dc2626' }}>
                      {totals.lapsed}
                    </td>
                    <td className="px-4 py-2.5">
                      {overallUtil !== null && (
                        <UtilBar
                          value={totals.claimed + totals.auto}
                          total={totals.allocated}
                          color={overallUtil >= 80 ? '#059669' : overallUtil >= 50 ? '#d97706' : '#dc2626'}
                        />
                      )}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-4 mt-4 text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {[
              { color: '#2563eb', label: 'Čerpáno — aktivně potvrzeno partnerem (TYPE1/TYPE2)' },
              { color: '#7c3aed', label: 'Auto — automaticky přiřazeno (TYPE3)' },
              { color: '#d97706', label: 'Uvolněno — partner vrátil místa zpět' },
              { color: '#dc2626', label: 'Propadlo — opce vypršela bez potvrzení' },
            ].map(({ color, label }) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                {label}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
