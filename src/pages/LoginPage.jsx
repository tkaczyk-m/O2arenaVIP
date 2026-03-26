import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Loader2, Building2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { setMockSession, USERS } from '@/lib/mockData'
import { getPartnersByBrand, getUserById as getStoreUser } from '@/lib/partnerStore'
import Footer from '@/components/layout/Footer'
import clsx from 'clsx'

const PERSONA_COLORS = ['#0066cc', '#7c3aed', '#b45309', '#0891b2', '#be185d', '#16a34a', '#ea580c']

// PLG decorative circles for default brand
function PLGBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden" style={{ backgroundColor: '#11002b' }}>
      {/* Large circles */}
      <div
        className="absolute rounded-full opacity-20"
        style={{ width: 480, height: 480, top: '-80px', left: '-120px', backgroundColor: '#3D2B6B' }}
      />
      <div
        className="absolute rounded-full opacity-15"
        style={{ width: 360, height: 360, top: '-60px', right: '-80px', backgroundColor: '#3D2B6B' }}
      />
      <div
        className="absolute rounded-full opacity-25"
        style={{ width: 280, height: 280, bottom: '60px', left: '-40px', backgroundColor: '#3D2B6B' }}
      />
      <div
        className="absolute rounded-full opacity-30"
        style={{ width: 200, height: 200, bottom: '20px', right: '40px', backgroundColor: '#f640c4' }}
      />
      {/* Accent circles */}
      <div
        className="absolute rounded-full opacity-60"
        style={{ width: 120, height: 120, top: '30%', left: '12%', backgroundColor: '#06d373' }}
      />
      <div
        className="absolute rounded-full opacity-20"
        style={{ width: 80, height: 80, top: '20%', right: '20%', backgroundColor: '#f640c4' }}
      />
    </div>
  )
}

function GenericBackground({ brand }) {
  return (
    <div
      className="absolute inset-0"
      style={{ backgroundColor: brand.accentDark || '#0a0a0a' }}
    >
      {/* Subtle grid pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, ${brand.primaryColor} 1px, transparent 0)`,
          backgroundSize: '32px 32px',
        }}
      />
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 30% 40%, ${brand.primaryColor}30 0%, transparent 60%),
                       radial-gradient(ellipse at 70% 80%, ${brand.primaryColor}15 0%, transparent 50%)`,
        }}
      />
    </div>
  )
}

export default function LoginPage() {
  const { t, brand, login } = useApp()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const brandPartners = getPartnersByBrand(brand.key)
  const personas = brandPartners.flatMap((partner, pi) =>
    (partner.users || []).map((user, ui) => ({
      userId: user.id,
      name: user.name,
      initials: user.initials || user.name.split(' ').map(w => w[0]).join('').slice(0, 2),
      company: partner.companyName,
      role: user.role === 'admin' ? 'Správce účtu' : 'Uživatel',
      color: PERSONA_COLORS[(pi * 2 + ui) % PERSONA_COLORS.length],
    }))
  )

  const handleLogin = async (userId) => {
    setLoading(true)
    setError('')
    await new Promise(r => setTimeout(r, 700))
    const user = USERS[userId] || getStoreUser(userId)
    if (!user) { setLoading(false); setError('Uživatel nenalezen.'); return }
    setMockSession(userId)
    login(user)
    navigate('/dashboard')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email || !password) {
      setError('Vyplňte e-mail a heslo')
      return
    }
    const allUsers = [
      ...Object.values(USERS),
      ...brandPartners.flatMap(p => p.users || []),
    ]
    const matchedUser = allUsers.find(u => u.email === email)
    const userId = matchedUser?.id || personas[0]?.userId || 'user-barbora'
    await handleLogin(userId)
  }

  const isDefaultBrand = brand.key === 'default'

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1 flex">
        {/* Left — branding panel */}
        <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 relative items-center justify-center p-12">
          {isDefaultBrand ? <PLGBackground /> : <GenericBackground brand={brand} />}
          <div className="relative z-10 text-center max-w-sm">
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
              style={{ backgroundColor: brand.primaryColor }}
            >
              <Building2 size={28} style={{ color: brand.primaryFg }} />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">{brand.arenaName}</h1>
            <p className="text-white/60 text-base leading-relaxed">
              Portál pro VIP partnery — správa vstupenek, doplňkových služeb a distribuce hostům.
            </p>
          </div>
        </div>

        {/* Right — login form */}
        <div
          className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10"
          style={{ backgroundColor: 'var(--color-bg)' }}
        >
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: brand.primaryColor }}
            >
              <Building2 size={18} style={{ color: brand.primaryFg }} />
            </div>
            <span className="text-lg font-bold" style={{ color: 'var(--color-text)' }}>
              {brand.shortName}
            </span>
          </div>

          <div className="w-full max-w-sm">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-1" style={{ color: 'var(--color-text)' }}>
                {t('login.title')}
              </h2>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                {t('login.subtitle')}
              </p>
            </div>

            {/* Login form */}
            <form onSubmit={handleSubmit} className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  {t('login.email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="input-field"
                  placeholder="vas@email.cz"
                  autoComplete="email"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5" style={{ color: 'var(--color-text)' }}>
                  {t('login.password')}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--color-text-subtle)' }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-500">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-primary w-full justify-center py-2.5"
              >
                {loading
                  ? <><Loader2 size={15} className="animate-spin" />{t('login.loggingIn')}</>
                  : t('login.submit')
                }
              </button>
            </form>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: 'var(--color-border)' }} />
              </div>
              <div className="relative flex justify-center text-xs px-3" style={{ backgroundColor: 'var(--color-bg)' }}>
                <span className="px-3" style={{ color: 'var(--color-text-subtle)', backgroundColor: 'var(--color-bg)' }}>
                  {t('login.demoTitle')}
                </span>
              </div>
            </div>

            {/* Demo personas */}
            <div>
              <p className="text-xs mb-3 text-center" style={{ color: 'var(--color-text-muted)' }}>
                {t('login.demoSubtitle')}
              </p>
              <div className="space-y-2">
                {personas.map(persona => (
                  <button
                    key={persona.userId}
                    onClick={() => handleLogin(persona.userId)}
                    disabled={loading}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all duration-150 disabled:opacity-50"
                    style={{
                      backgroundColor: 'var(--color-surface)',
                      borderColor: 'var(--color-border)',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = brand.primaryColor
                      e.currentTarget.style.backgroundColor = `${brand.primaryColor}08`
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = 'var(--color-border)'
                      e.currentTarget.style.backgroundColor = 'var(--color-surface)'
                    }}
                  >
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                      style={{ backgroundColor: persona.color, color: '#fff' }}
                    >
                      {persona.initials}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {persona.name}
                      </div>
                      <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                        {persona.company} · {persona.role}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
