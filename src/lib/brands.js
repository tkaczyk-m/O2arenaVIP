/**
 * Brand configurations for multi-tenant white-labeling.
 * In production: detect from hostname.
 * In dev: use ?brand=xxx query param or localStorage.
 */

export const BRANDS = {
  default: {
    key: 'default',
    name: 'VIP Partner Portal',
    arenaName: 'PLG Venues',
    shortName: 'PLG',
    primaryColor: '#06d373',
    primaryDark: '#04a859',
    primaryLight: '#33dc8c',
    primaryFg: '#0a1a10',
    loginBg: 'plg',        // handled in LoginPage component
    logoText: 'PLG',
    accentDark: '#11002b', // navy from plgmoments.com
  },
  o2arena: {
    key: 'o2arena',
    name: 'O2 Arena VIP Partner Portal',
    arenaName: 'O2 Arena Praha',
    shortName: 'O2 Arena',
    primaryColor: '#0066cc',
    primaryDark: '#0052a3',
    primaryLight: '#3388dd',
    primaryFg: '#ffffff',
    loginBg: 'o2arena',
    logoText: 'O2 Arena',
    accentDark: '#001a3d',
  },
  tarena: {
    key: 'tarena',
    name: 'T-Arena VIP Partner Portal',
    arenaName: 'T-Arena Brno',
    shortName: 'T-Arena',
    primaryColor: '#e20074',
    primaryDark: '#b5005c',
    primaryLight: '#ea3390',
    primaryFg: '#ffffff',
    loginBg: 'tarena',
    logoText: 'T-Arena',
    accentDark: '#1a0010',
  },
  slavia: {
    key: 'slavia',
    name: 'Eden VIP Partner Portal',
    arenaName: 'Fortuna Arena (Eden)',
    shortName: 'Slavia',
    primaryColor: '#cc0000',
    primaryDark: '#a30000',
    primaryLight: '#dd3333',
    primaryFg: '#ffffff',
    loginBg: 'slavia',
    logoText: 'Eden',
    accentDark: '#1a0000',
  },
}

export function detectBrand() {
  // 1. URL query param (dev mode)
  const params = new URLSearchParams(window.location.search)
  const paramBrand = params.get('brand')
  if (paramBrand && BRANDS[paramBrand]) return BRANDS[paramBrand]

  // 2. localStorage override
  const stored = localStorage.getItem('vip_brand')
  if (stored && BRANDS[stored]) return BRANDS[stored]

  // 3. Hostname detection (production)
  const hostname = window.location.hostname
  if (hostname.includes('o2arena')) return BRANDS.o2arena
  if (hostname.includes('tarena') || hostname.includes('t-arena')) return BRANDS.tarena
  if (hostname.includes('slavia') || hostname.includes('eden')) return BRANDS.slavia

  return BRANDS.default
}

export function applyBrandToDOM(brand) {
  const root = document.documentElement
  root.setAttribute('data-brand', brand.key)
  root.style.setProperty('--color-primary', brand.primaryColor)
  root.style.setProperty('--color-primary-dark', brand.primaryDark)
  root.style.setProperty('--color-primary-light', brand.primaryLight)
  root.style.setProperty('--color-primary-fg', brand.primaryFg)

  // Update sidebar active colors too
  root.style.setProperty('--color-sidebar-active-text', brand.primaryColor)
  root.style.setProperty('--color-sidebar-active-bg', `${brand.primaryColor}14`)

  // Update page title
  document.title = brand.name
}
