import { useEffect, useState } from 'react'
import { Users, UserPlus, Shield, User, Mail, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getPartnerUsers } from '@/lib/mockData'
import AccountTabNav from '@/components/account/AccountTabNav'

function RoleBadge({ role }) {
  const isAdmin = role === 'admin'
  return (
    <span
      className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
      style={{
        color: isAdmin ? 'var(--color-primary)' : '#6b7280',
        backgroundColor: isAdmin ? 'var(--color-primary)' + '15' : '#6b728015',
      }}
    >
      {isAdmin ? <Shield size={11} /> : <User size={11} />}
      {isAdmin ? 'Admin' : 'Uživatel'}
    </span>
  )
}

function UserRow({ user, isCurrentUser, onToggleActive, onDelete }) {
  return (
    <div className="flex items-center gap-3 py-3 border-b last:border-0" style={{ borderColor: 'var(--color-border)' }}>
      {/* Avatar */}
      <div
        className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
        style={{
          backgroundColor: user.active
            ? 'var(--color-primary)' + '18'
            : 'var(--color-surface-2)',
          color: user.active ? 'var(--color-primary)' : 'var(--color-text-muted)',
          opacity: user.active ? 1 : 0.6,
        }}
      >
        {user.initials}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="font-medium text-sm"
            style={{ color: user.active ? 'var(--color-text)' : 'var(--color-text-muted)' }}
          >
            {user.name}
          </span>
          {isCurrentUser && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-muted)' }}
            >
              vy
            </span>
          )}
          <RoleBadge role={user.role} />
          {!user.active && (
            <span
              className="text-xs px-1.5 py-0.5 rounded"
              style={{ backgroundColor: '#6b728015', color: '#6b7280' }}
            >
              Neaktivní
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5 mt-0.5 text-xs" style={{ color: 'var(--color-text-muted)' }}>
          <Mail size={11} />
          {user.email}
        </div>
      </div>

      {/* Actions — only shown for non-current admins */}
      {!isCurrentUser && (
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onToggleActive(user.id)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            title={user.active ? 'Deaktivovat' : 'Aktivovat'}
          >
            {user.active
              ? <ToggleRight size={18} style={{ color: '#059669' }} />
              : <ToggleLeft size={18} />
            }
          </button>
          <button
            onClick={() => onDelete(user.id)}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = '#dc262618'
              e.currentTarget.style.color = '#dc2626'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.color = 'var(--color-text-muted)'
            }}
            title="Odebrat uživatele"
          >
            <Trash2 size={15} />
          </button>
        </div>
      )}
    </div>
  )
}

function AddUserModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('user')
  const [saving, setSaving] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setSaving(true)
    setTimeout(() => {
      onAdd({
        id: `u-new-${Date.now()}`,
        name: name.trim(),
        email: email.trim(),
        role,
        initials: name.trim().split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase(),
        active: true,
      })
      onClose()
    }, 500)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
      <div className="card rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <h3 className="font-bold text-base mb-4" style={{ color: 'var(--color-text)' }}>
          Přidat uživatele
        </h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
              Jméno a příjmení
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Jana Nováková"
              className="input-field w-full"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
              E-mail
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="jana.novakova@firma.cz"
              className="input-field w-full"
              required
            />
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block" style={{ color: 'var(--color-text-muted)' }}>
              Role
            </label>
            <select
              value={role}
              onChange={e => setRole(e.target.value)}
              className="input-field w-full"
            >
              <option value="user">Uživatel</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="btn-primary flex-1 justify-center"
            >
              {saving ? 'Přidávám…' : 'Přidat uživatele'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="btn-ghost flex-1 justify-center"
            >
              Zrušit
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const { currentPartner, currentUser } = useApp()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)

  useEffect(() => {
    if (!currentPartner) return
    getPartnerUsers(currentPartner.id).then(data => {
      setUsers(data)
      setLoading(false)
    })
  }, [currentPartner])

  function handleToggleActive(userId) {
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, active: !u.active } : u))
  }

  function handleDelete(userId) {
    if (!confirm('Opravdu chcete odebrat tohoto uživatele?')) return
    setUsers(prev => prev.filter(u => u.id !== userId))
  }

  function handleAdd(newUser) {
    setUsers(prev => [...prev, newUser])
  }

  const isCurrentUserAdmin = currentUser?.role === 'admin'

  return (
    <div className="animate-fade-in max-w-2xl">
      <AccountTabNav />

      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
          Správa uživatelů
        </h1>
        {isCurrentUserAdmin && (
          <button
            onClick={() => setShowAddModal(true)}
            className="btn-primary"
          >
            <UserPlus size={15} />
            Přidat uživatele
          </button>
        )}
      </div>

      {loading ? (
        <div className="card rounded-xl p-4 animate-pulse space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-12 rounded-lg" style={{ backgroundColor: 'var(--color-surface-2)' }} />
          ))}
        </div>
      ) : (
        <div className="card rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Users size={15} style={{ color: 'var(--color-text-muted)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                {users.length} {users.length === 1 ? 'uživatel' : users.length < 5 ? 'uživatelé' : 'uživatelů'}
              </span>
            </div>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              {users.filter(u => u.active).length} aktivních
            </span>
          </div>

          {users.map(user => (
            <UserRow
              key={user.id}
              user={user}
              isCurrentUser={user.id === currentUser?.id}
              onToggleActive={handleToggleActive}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {!isCurrentUserAdmin && (
        <p className="text-xs mt-3" style={{ color: 'var(--color-text-muted)' }}>
          Pro přidání nebo odebrání uživatelů kontaktujte administrátora.
        </p>
      )}

      {showAddModal && (
        <AddUserModal onClose={() => setShowAddModal(false)} onAdd={handleAdd} />
      )}
    </div>
  )
}
