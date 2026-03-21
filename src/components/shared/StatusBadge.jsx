import clsx from 'clsx'

const STATUS_CONFIG = {
  OPTION_PENDING: { label: null, color: 'amber' },
  AUTO_CONFIRMED: { label: null, color: 'blue' },
  CONFIRMED: { label: null, color: 'green' },
  LAPSED: { label: null, color: 'gray' },
  DECLINED: { label: null, color: 'red' },
  // Order statuses
  RESERVED: { label: null, color: 'amber' },
  PAID: { label: null, color: 'green' },
  CANCELLED: { label: null, color: 'red' },
  // Ticket statuses
  UNASSIGNED: { label: null, color: 'gray' },
  ASSIGNED: { label: null, color: 'blue' },
  SENT: { label: null, color: 'green' },
  RELEASED: { label: null, color: 'gray' },
}

const COLOR_STYLES = {
  green: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  red: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  blue: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  gray: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  purple: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const DOT_COLORS = {
  green: 'bg-emerald-500',
  amber: 'bg-amber-500',
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  gray: 'bg-gray-400',
  purple: 'bg-purple-500',
}

export default function StatusBadge({ status, label, color, dot = true, size = 'sm' }) {
  const config = STATUS_CONFIG[status] || {}
  const resolvedColor = color || config.color || 'gray'
  const resolvedLabel = label || config.label || status

  return (
    <span className={clsx(
      'badge',
      COLOR_STYLES[resolvedColor],
      size === 'xs' ? 'text-xs px-1.5 py-0.5' : 'text-xs px-2 py-0.5'
    )}>
      {dot && (
        <span className={clsx('w-1.5 h-1.5 rounded-full shrink-0', DOT_COLORS[resolvedColor])} />
      )}
      {resolvedLabel}
    </span>
  )
}
