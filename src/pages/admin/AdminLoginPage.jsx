import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Building2, Loader2 } from 'lucide-react'
import { useAdmin } from '@/context/AdminContext'

export default function AdminLoginPage() {
  const { adminLogin, adminUser, ADMIN_USERS } = useAdmin()
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (adminUser) navigate('/admin-clients/brand', { replace: true })
  }, [adminUser, navigate])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    await new Promise(r => setTimeout(r, 500))

    const user = ADMIN_USERS.find(
      u => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    )
    if (user) {
      adminLogin(user)
      navigate('/admin-clients/brand')
    } else {
      setError('Nesprávný e-mail nebo heslo.')
      setLoading(false)
    }
  }

  const fillDemo = (user) => {
    setEmail(user.email)
    setPassword(user.password)
    setError('')
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: '#0e1a2e' }}
    >
      {/* Background pattern */}
      <div
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, #4a9eff 1px, transparent 0)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
            style={{ backgroundColor: '#0066cc22', border: '1px solid #0066cc44' }}
          >
            <Building2 size={26} style={{ color: '#0066cc' }} />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Admin Portal</h1>
          <p className="text-sm" style={{ color: '#94a3b8' }}>Správa B2B partnerů</p>
        </div>

        {/* Card */}
        <div
          className="rounded-xl p-6 shadow-xl"
          style={{ backgroundColor: '#1e2d42', border: '1px solid #2d3f5a' }}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium mb-1.5" style={{ color: '#94a3b8' }}>
                E-mail
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="vas@arena.cz"
                required
                className="w-full px-3 py-2.5 rounded-lg text-sm outline-none transition-all"
                style={{
                  backgroundColor: '#0e1a2e',
                  border: '1px solid #2d3f5a',
                  color: '#e2e8f0',
                }}
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
                  className="w-full px-3 py-2.5 pr-10 rounded-lg text-sm outline-none transition-all"
                  style={{
                    backgroundColor: '#0e1a2e',
                    border: '1px solid #2d3f5a',
                    color: '#e2e8f0',
                  }}
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

          {/* Demo credentials */}
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid #2d3f5a' }}>
            <p className="text-xs mb-2.5 text-center" style={{ color: '#64748b' }}>Demo přístupy</p>
            <div className="space-y-1.5">
              {ADMIN_USERS.map(u => (
                <button
                  key={u.id}
                  type="button"
                  onClick={() => fillDemo(u)}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors"
                  style={{ backgroundColor: '#0e1a2e', color: '#94a3b8', border: '1px solid #2d3f5a' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#0066cc66' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#2d3f5a' }}
                >
                  <span className="font-medium" style={{ color: '#e2e8f0' }}>{u.name}</span>
                  <span style={{ color: '#64748b' }}>{u.email}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-center mt-2" style={{ color: '#475569' }}>
              heslo: <span style={{ color: '#94a3b8' }}>admin123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
