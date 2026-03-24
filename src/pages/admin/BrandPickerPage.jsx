import { useNavigate } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { useAdmin } from '@/context/AdminContext'
import { BRANDS } from '@/lib/brands'

const BRAND_META = {
  o2arena: { color: '#0066cc', bg: '#0066cc12', border: '#0066cc33', desc: 'O2 Arena Praha' },
  tarena:  { color: '#e20074', bg: '#e2007412', border: '#e2007433', desc: 'T-Arena Brno' },
  slavia:  { color: '#cc0000', bg: '#cc000012', border: '#cc000033', desc: 'Fortuna Arena (Eden)' },
  default: { color: '#06d373', bg: '#06d37312', border: '#06d37333', desc: 'PLG Venues' },
}

export default function BrandPickerPage() {
  const { adminUser, setActiveBrand } = useAdmin()
  const navigate = useNavigate()

  const handlePick = (brand) => {
    setActiveBrand(brand)
    navigate('/admin/clients')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#0e1a2e' }}
    >
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #4a9eff 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Vyberte venue</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>
            Zdravím, <span className="text-white font-medium">{adminUser?.name}</span>. Pro které venue chcete spravovat partnery?
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.values(BRANDS).map(brand => {
            const meta = BRAND_META[brand.key]
            return (
              <button
                key={brand.key}
                onClick={() => handlePick(brand)}
                className="group relative text-left p-5 rounded-xl transition-all duration-150"
                style={{
                  backgroundColor: '#1e2d42',
                  border: `1px solid #2d3f5a`,
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = meta.border
                  e.currentTarget.style.backgroundColor = meta.bg
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = '#2d3f5a'
                  e.currentTarget.style.backgroundColor = '#1e2d42'
                }}
              >
                {/* Color dot */}
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 text-base font-bold"
                  style={{ backgroundColor: meta.bg, color: meta.color, border: `1px solid ${meta.border}` }}
                >
                  {brand.shortName.slice(0, 2)}
                </div>

                <div className="font-semibold text-white text-sm mb-0.5">{brand.shortName}</div>
                <div className="text-xs" style={{ color: '#64748b' }}>{meta.desc}</div>

                <ArrowRight
                  size={15}
                  className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ color: meta.color }}
                />
              </button>
            )
          })}
        </div>

        <p className="text-xs text-center mt-6" style={{ color: '#475569' }}>
          Venue lze kdykoli přepnout v horní liště administrace.
        </p>
      </div>
    </div>
  )
}
