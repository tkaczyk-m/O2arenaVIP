import { useEffect, useState } from 'react'
import { ShoppingBag, Download, Calendar, CreditCard } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getOrders, getPartner } from '@/lib/mockData'
import StatusBadge from '@/components/shared/StatusBadge'
import AccountTabNav from '@/components/account/AccountTabNav'

const STATUS_COLOR = {
  RESERVED: 'amber',
  CONFIRMED: 'blue',
  PAID: 'green',
  CANCELLED: 'gray',
}

const STATUS_LABEL = {
  RESERVED: 'Rezervováno',
  CONFIRMED: 'Potvrzeno',
  PAID: 'Zaplaceno',
  CANCELLED: 'Zrušeno',
}

const KIND_CONFIG = {
  TYPE1: { label: 'Smluvní místo', color: '#0066cc' },
  TYPE2: { label: 'Benefit (výběr)', color: '#7c3aed' },
  TYPE3: { label: 'Benefit (auto)', color: '#059669' },
}

function formatDate(d) {
  return new Date(d).toLocaleDateString('cs-CZ', { day: 'numeric', month: 'short', year: 'numeric' })
}

function OrderRow({ order, remainingBudget }) {
  const kindCfg = KIND_CONFIG[order.kind] || {}
  const hasCash = order.totalCZK > 0
  const hasBenefit = order.benefitValue > 0

  return (
    <div
      className="card rounded-xl p-4 mb-3"
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded"
              style={{ color: kindCfg.color, backgroundColor: `${kindCfg.color}18` }}
            >
              {kindCfg.label}
            </span>
            <StatusBadge
              status={order.status}
              label={STATUS_LABEL[order.status] || order.status}
              color={STATUS_COLOR[order.status] || 'gray'}
            />
          </div>
          <div className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
            {order.eventName}
          </div>
          <div className="text-xs mt-0.5 flex items-center gap-1.5" style={{ color: 'var(--color-text-muted)' }}>
            <Calendar size={12} />
            {formatDate(order.eventDate)}
            <span className="opacity-40">·</span>
            {order.id}
          </div>
        </div>
        <div className="text-right shrink-0">
          {hasCash ? (
            <>
              <div className="text-base font-bold" style={{ color: 'var(--color-text)' }}>
                {order.totalCZK.toLocaleString('cs-CZ')} Kč
              </div>
              {order.paymentMethod && (
                <div className="text-xs flex items-center gap-1 justify-end mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  <CreditCard size={11} />
                  {order.paymentMethod === 'INVOICE' ? 'Faktura' : 'Karta'}
                </div>
              )}
            </>
          ) : hasBenefit ? (
            <div className="text-sm font-semibold" style={{ color: '#7c3aed' }}>
              −{order.benefitValue.toLocaleString('cs-CZ')} Kč
              <div className="text-xs font-normal" style={{ color: 'var(--color-text-muted)' }}>
                z benefit budgetu
              </div>
              {remainingBudget !== null && (
                <div className="text-xs font-normal mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  zbývá {remainingBudget.toLocaleString('cs-CZ')} Kč
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm font-semibold" style={{ color: 'var(--color-text-muted)' }}>
              0 Kč
            </div>
          )}
        </div>
      </div>

      {/* Items */}
      <div
        className="text-xs mb-3 flex flex-wrap gap-2"
        style={{ color: 'var(--color-text-muted)' }}
      >
        {order.items.map((item, i) => (
          <span key={i} className="flex items-center gap-1">
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ backgroundColor: kindCfg.color }}
            />
            {item.label}{item.count > 1 ? ` (${item.count}×)` : ''}
          </span>
        ))}
      </div>

      {/* Price breakdown for TYPE1 */}
      {order.kind === 'TYPE1' && (
        <div
          className="rounded-lg p-3 mb-3 text-xs space-y-1"
          style={{ backgroundColor: 'var(--color-surface-2)' }}
        >
          {order.venueFee > 0 && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Pronájem</span>
              <span style={{ color: 'var(--color-text)' }}>{order.venueFee.toLocaleString('cs-CZ')} Kč</span>
            </div>
          )}
          {order.cateringFee > 0 && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Catering</span>
              <span style={{ color: 'var(--color-text)' }}>{order.cateringFee.toLocaleString('cs-CZ')} Kč</span>
            </div>
          )}
          {order.addonsFee > 0 && (
            <div className="flex justify-between">
              <span style={{ color: 'var(--color-text-muted)' }}>Doplňkové služby</span>
              <span style={{ color: 'var(--color-text)' }}>{order.addonsFee.toLocaleString('cs-CZ')} Kč</span>
            </div>
          )}
          {order.transactionFee > 0 && (
            <div className="flex justify-between border-t pt-1" style={{ borderColor: 'var(--color-border)' }}>
              <span style={{ color: 'var(--color-text-muted)' }}>Transakční poplatek</span>
              <span style={{ color: 'var(--color-text)' }}>{order.transactionFee.toLocaleString('cs-CZ')} Kč</span>
            </div>
          )}
        </div>
      )}

      {/* RESERVED — payment due */}
      {order.status === 'RESERVED' && (
        <div className="space-y-2">
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs"
            style={{ backgroundColor: 'rgba(220,38,38,0.08)', border: '1px solid rgba(220,38,38,0.25)' }}
          >
            <span style={{ color: '#dc2626', fontWeight: 600 }}>Nezaplaceno</span>
            {order.paymentDueDate && (
              <span style={{ color: '#dc2626' }}>
                — uhradit do {formatDate(order.paymentDueDate)}
              </span>
            )}
          </div>
          <button
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
            style={{ color: '#fff', backgroundColor: '#dc2626' }}
            onClick={() => alert('Platební brána (demo)')}
          >
            <CreditCard size={13} />
            Zaplatit nyní
          </button>
        </div>
      )}

      {/* Actions */}
      {order.status === 'PAID' && (
        <button
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
          style={{
            color: 'var(--color-primary)',
            backgroundColor: 'var(--color-primary)' + '12',
          }}
          onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-primary)' + '20'}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = 'var(--color-primary)' + '12'}
          onClick={() => alert('Stahování faktury (demo)')}
        >
          <Download size={13} />
          Stáhnout fakturu
        </button>
      )}
    </div>
  )
}

export default function OrdersPage() {
  const { currentPartner } = useApp()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [remainingBudget, setRemainingBudget] = useState(null)

  useEffect(() => {
    if (!currentPartner) return
    Promise.all([
      getOrders(currentPartner.id),
      getPartner(currentPartner.id),
    ]).then(([orderData, partnerData]) => {
      setOrders(orderData)
      if (partnerData?.benefitBudgetCZK > 0) {
        setRemainingBudget(partnerData.benefitBudgetCZK - partnerData.spentBenefitCZK)
      }
      setLoading(false)
    })
  }, [currentPartner])

  return (
    <div className="animate-fade-in max-w-3xl">
      <AccountTabNav />

      <h1 className="text-xl font-bold mb-5" style={{ color: 'var(--color-text)' }}>
        Moje objednávky
      </h1>

      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-36 rounded-xl" style={{ backgroundColor: 'var(--color-surface-2)' }} />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="card rounded-xl p-12 text-center">
          <ShoppingBag size={36} className="mx-auto mb-3 opacity-30" style={{ color: 'var(--color-text-muted)' }} />
          <p className="font-medium" style={{ color: 'var(--color-text-muted)' }}>Zatím žádné objednávky</p>
        </div>
      ) : (
        <div>
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {[
              { label: 'Celkem objednávek', value: orders.length },
              { label: 'Zaplaceno', value: orders.filter(o => o.status === 'PAID').length },
              {
                label: 'Celková hodnota',
                value: orders.reduce((s, o) => s + o.totalCZK, 0).toLocaleString('cs-CZ') + ' Kč',
              },
            ].map(({ label, value }) => (
              <div key={label} className="card rounded-xl p-3 text-center">
                <div className="text-base font-bold" style={{ color: 'var(--color-text)' }}>{value}</div>
                <div className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>

          {orders.map(order => <OrderRow key={order.id} order={order} remainingBudget={remainingBudget} />)}
        </div>
      )}
    </div>
  )
}
