import { Sun, Moon } from 'lucide-react'
import { useApp } from '@/context/AppContext'

export default function Footer() {
  const { t, theme, toggleTheme } = useApp()

  return (
    <footer
      className="border-t px-4 py-3 flex flex-wrap items-center justify-between gap-2 text-xs"
      style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-subtle)' }}
    >
      <span>{t('common.copyRight')}</span>
      <div className="flex items-center gap-4">
        <a
          href="#"
          className="hover:underline transition-colors"
          style={{ color: 'var(--color-text-subtle)' }}
          onClick={e => e.preventDefault()}
        >
          {t('common.terms')}
        </a>
        <a
          href="#"
          className="hover:underline transition-colors"
          style={{ color: 'var(--color-text-subtle)' }}
          onClick={e => e.preventDefault()}
        >
          {t('common.cookies')}
        </a>
        <button
          onClick={toggleTheme}
          className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
          style={{ color: 'var(--color-text-subtle)' }}
          title={theme === 'dark' ? t('common.lightMode') : t('common.darkMode')}
        >
          {theme === 'dark'
            ? <><Sun size={13} /><span>{t('common.lightMode')}</span></>
            : <><Moon size={13} /><span>{t('common.darkMode')}</span></>
          }
        </button>
      </div>
    </footer>
  )
}
