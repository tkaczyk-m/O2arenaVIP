import { useState, useEffect } from 'react'
import { Clock } from 'lucide-react'
import { useApp } from '@/context/AppContext'

function getTimeLeft(deadline) {
  const diff = new Date(deadline) - new Date()
  if (diff <= 0) return null
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  return { days, hours, minutes, totalMs: diff }
}

export default function CountdownTimer({ deadline, className = '' }) {
  const { t } = useApp()
  const [timeLeft, setTimeLeft] = useState(() => getTimeLeft(deadline))

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(getTimeLeft(deadline))
    }, 60000) // Update every minute
    return () => clearInterval(timer)
  }, [deadline])

  if (!timeLeft) {
    return (
      <span className={`inline-flex items-center gap-1 text-xs text-gray-500 ${className}`}>
        <Clock size={12} />
        {t('event.optionExpired')}
      </span>
    )
  }

  const isUrgent = timeLeft.days < 3
  const isWarning = timeLeft.days < 7

  const color = isUrgent
    ? 'text-red-600 dark:text-red-400'
    : isWarning
    ? 'text-amber-600 dark:text-amber-500'
    : 'text-emerald-600 dark:text-emerald-400'

  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${color} ${className}`}>
      <Clock size={12} className={isUrgent ? 'animate-pulse' : ''} />
      {timeLeft.days > 0 && <span>{timeLeft.days}{t('event.daysLeft')}</span>}
      {timeLeft.days === 0 && timeLeft.hours > 0 && <span>{timeLeft.hours}{t('event.hoursLeft')}</span>}
      {timeLeft.days === 0 && timeLeft.hours === 0 && <span>{timeLeft.minutes}{t('event.minutesLeft')}</span>}
    </span>
  )
}
