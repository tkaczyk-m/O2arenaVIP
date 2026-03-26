import { useEffect, useState } from 'react'
import { FileText, Phone, Mail, User, Calendar, Building2, Hash, Ticket, TrendingUp } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getPartner } from '@/lib/mockData'
import AccountTabNav from '@/components/account/AccountTabNav'

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
      <Icon size={15} className="mt-0.5 shrink-0" style={{ color: 'var(--color-text-muted)' }} />
      <div className="flex-1 min-w-0">
        <div className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
        <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>{value || '—'}</div>
      </div>
    </div>
  )
}

function KindBadge({ kind }) {
  const cfg = {
    TYPE1: { label: 'Smluvní místo', color: '#0066cc' },
    TYPE2: { label: 'Benefit (výběr)', color: '#7c3aed' },
    TYPE3: { label: 'Benefit (auto)', color: '#059669' },
  }[kind] || { label: kind, color: '#6b7280' }
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ color: cfg.color, backgroundColor: `${cfg.color}18` }}
    >
      {cfg.label}
    </span>
  )
}

function BudgetWidget({ partner }) {
  const hasBudget = partner.benefitBudgetCZK > 0
  if (!hasBudget) return null

  const spent = partner.spentBenefitCZK
  const total = partner.benefitBudgetCZK
  const remaining = total - spent
  const pct = Math.round((spent / total) * 100)
  const barColor = pct > 85 ? '#dc2626' : pct > 65 ? '#d97706' : 'var(--color-primary)'

  return (
    <div className="card rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: 'rgba(124,58,237,0.12)' }}
        >
          <TrendingUp size={16} style={{ color: '#7c3aed' }} />
        </div>
        <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
          Benefit budget
        </h2>
      </div>

      <div className="flex items-end justify-between mb-2">
        <div>
          <div className="text-2xl font-bold" style={{ color: 'var(--color-text)' }}>
            {remaining.toLocaleString('cs-CZ')} Kč
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            zbývá z {total.toLocaleString('cs-CZ')} Kč ročního budgetu
          </div>
        </div>
        <div
          className="text-sm font-semibold px-2 py-1 rounded-lg"
          style={{
            color: barColor,
            backgroundColor: `${barColor}15`,
          }}
        >
          {pct} % čerpáno
        </div>
      </div>

      <div
        className="h-2 rounded-full overflow-hidden"
        style={{ backgroundColor: 'var(--color-surface-2)' }}
      >
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: barColor }}
        />
      </div>

      <div className="grid grid-cols-2 gap-3 mt-4">
        <div
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: 'var(--color-surface-2)' }}
        >
          <div className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {spent.toLocaleString('cs-CZ')} Kč
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>čerpáno</div>
        </div>
        <div
          className="rounded-lg p-3 text-center"
          style={{ backgroundColor: 'var(--color-surface-2)' }}
        >
          <div className="text-sm font-bold" style={{ color: 'var(--color-text)' }}>
            {remaining.toLocaleString('cs-CZ')} Kč
          </div>
          <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>dostupné</div>
        </div>
      </div>
    </div>
  )
}

export default function ContractPage() {
  const { currentPartner } = useApp()
  const [partner, setPartner] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!currentPartner) return
    getPartner(currentPartner.id).then(p => {
      setPartner(p)
      setLoading(false)
    })
  }, [currentPartner])

  if (loading) {
    return (
      <div className="animate-fade-in">
        <AccountTabNav />
        <div className="space-y-4 animate-pulse">
          <div className="h-48 rounded-xl" style={{ backgroundColor: 'var(--color-surface-2)' }} />
          <div className="h-32 rounded-xl" style={{ backgroundColor: 'var(--color-surface-2)' }} />
        </div>
      </div>
    )
  }

  if (!partner) return null

  const { contract } = partner

  const formatDate = (d) => new Date(d).toLocaleDateString('cs-CZ', {
    day: 'numeric', month: 'long', year: 'numeric',
  })

  return (
    <div className="animate-fade-in max-w-3xl">
      <AccountTabNav />

      <h1 className="text-xl font-bold mb-5" style={{ color: 'var(--color-text)' }}>
        Moje smlouva
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Contract details */}
        <div className="card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: 'var(--color-primary)' + '18' }}
            >
              <FileText size={16} style={{ color: 'var(--color-primary)' }} />
            </div>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              Detail smlouvy
            </h2>
          </div>

          <InfoRow icon={Hash} label="Číslo smlouvy" value={contract.id} />
          <InfoRow icon={Ticket} label="Typ partnerství" value={contract.type} />
          <InfoRow icon={Building2} label="Společnost" value={partner.companyName} />
          <InfoRow icon={Hash} label="IČO" value={partner.ico} />
          <InfoRow icon={Calendar} label="Platnost od" value={formatDate(contract.validFrom)} />
          <InfoRow icon={Calendar} label="Platnost do" value={formatDate(contract.validTo)} />

          {/* Allocation kinds */}
          <div className="pt-3 mt-1">
            <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Typy alokací</div>
            <div className="flex flex-wrap gap-1.5">
              {partner.allocationKinds.map(k => <KindBadge key={k} kind={k} />)}
            </div>
          </div>

          {/* Contracted seats */}
          {partner.type1Allocation && (
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
              <div className="text-xs mb-2" style={{ color: 'var(--color-text-muted)' }}>Smluvní místa</div>
              {partner.type1Allocation.skyboxes?.length > 0 && (
                <div className="text-sm" style={{ color: 'var(--color-text)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Skyboxy: </span>
                  <span className="font-medium">{partner.type1Allocation.skyboxes.join(', ')}</span>
                </div>
              )}
              {partner.type1Allocation.clubSections?.length > 0 && (
                <div className="text-sm mt-1" style={{ color: 'var(--color-text)' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Klubová místa: </span>
                  <span className="font-medium">
                    {partner.clubSeatMap && Object.values(partner.clubSeatMap).some(v => v?.length > 0)
                      ? Object.entries(partner.clubSeatMap)
                          .flatMap(([sId, keys]) => (keys || []).map(k => `KS-${sId}-${k}`))
                          .join(', ')
                      : partner.type1Allocation.clubSections.join(', ')
                    }
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Account manager */}
        <div className="card rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: '#05966918' }}
            >
              <User size={16} style={{ color: '#059669' }} />
            </div>
            <h2 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              Account Manager
            </h2>
          </div>

          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center text-base font-bold shrink-0"
              style={{
                backgroundColor: 'var(--color-primary)' + '18',
                color: 'var(--color-primary)',
              }}
            >
              {contract.accountManagerName.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                {contract.accountManagerName}
              </div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Váš account manager
              </div>
            </div>
          </div>

          <InfoRow icon={Mail} label="E-mail" value={contract.accountManagerEmail} />
          <InfoRow icon={Phone} label="Telefon" value={contract.accountManagerPhone} />

          <div className="mt-4 pt-4 border-t" style={{ borderColor: 'var(--color-border)' }}>
            <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Pro změny smlouvy nebo dotazy k alokacím kontaktujte svého account managera.
            </p>
          </div>
        </div>
      </div>

      {/* Budget widget */}
      <BudgetWidget partner={partner} />
    </div>
  )
}
