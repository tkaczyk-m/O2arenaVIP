import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, CalendarDays, Loader2 } from 'lucide-react'
import { adminLogin, getAdminSession, DEMO_CREDENTIALS } from '@/lib/adminAuth'

export default function EventsAdminLoginPage() {
  const navigate = useNavigate()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (getAdminSession()) navigate('/admin-event/events', { replace: true })
  }, [navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 400))
    const result = adminLogin(username.trim(), password)
    if (result.success) {
      navigate('/admin-event/events', { replace: true })
    } else {
      setError('Nesprávné přihlašovací údaje.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundColor: '#0e1a2e' }}>
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #4a9eff 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: '#0066cc22', border: '1px solid #0066cc44' }}
          >
            <CalendarDays size={26} style={{ color: '#0066cc' }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Events Admin</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>Správa akcí a termínů</p>
        </div>

        <div className="rounded-xl p-6 shadow-xl" style={{ backgroundColor: '#1e2d42', border: '1px solid #2d3f5a' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                Uživatelské jméno
              </label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                placeholder="o2arena"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none"
                style={{ backgroundColor: '#0e1a2e', border: '1px solid #2d3f5a', color: '#e2e8f0' }}
                onFocus={e => { e.target.style.borderColor = '#0066cc' }}
                onBlur={e => { e.target.style.borderColor = '#2d3f5a' }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                Heslo
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none"
                  style={{ backgroundColor: '#0e1a2e', border: '1px solid #2d3f5a', color: '#e2e8f0' }}
                  onFocus={e => { e.target.style.borderColor = '#0066cc' }}
                  onBlur={e => { e.target.style.borderColor = '#2d3f5a' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: '#64748b' }}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-xs px-3 py-2 rounded-lg" style={{ backgroundColor: '#7f1d1d22', color: '#fca5a5', border: '1px solid #7f1d1d44' }}>
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-lg text-sm font-semibold flex items-center justify-center gap-2 transition-opacity disabled:opacity-60"
              style={{ backgroundColor: '#0066cc', color: '#fff' }}
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? 'Přihlašování…' : 'Přihlásit se'}
            </button>
          </form>

          <div className="mt-5 pt-4" style={{ borderTop: '1px solid #2d3f5a' }}>
            <p className="text-xs mb-2.5 text-center" style={{ color: '#64748b' }}>Demo přístupy (kliknutím vyplníte)</p>
            <div className="space-y-1.5">
              {DEMO_CREDENTIALS.map(c => (
                <button
                  key={c.username}
                  type="button"
                  onClick={() => { setUsername(c.username); setPassword(c.password); setError('') }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs"
                  style={{ backgroundColor: '#0e1a2e', color: '#94a3b8', border: '1px solid #2d3f5a' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0066cc66' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2d3f5a' }}
                >
                  <span className="font-medium" style={{ color: '#e2e8f0' }}>{c.brandName}</span>
                  <span style={{ color: '#64748b' }}>{c.username} / {c.password}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
