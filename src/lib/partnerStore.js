const STORE_KEY = 'vip_partners'
const API = '/api/partners'

// ─── Seed data — partners + their B2B SPA users for all 4 brands ──────────────

const SEED_PARTNERS = [
  // ── O2 Arena Praha ────────────────────────────────────────────────────────
  {
    id: 'barbora', brandId: 'o2arena',
    companyName: 'ŠKODA Auto a.s.', ico: '00177041',
    address: 'tř. Václava Klementa 869, 293 01 Mladá Boleslav',
    contactPerson: { firstName: 'Barbora', lastName: 'Chaloupecká', email: 'barbora.chaloupecka@skoda-auto.cz' },
    contract: { id: 'VIP-2024-0089', type: 'Premium Skybox', validFrom: '2024-01-01', validTo: '2026-12-31', amountCZK: 1200000, accountManagerName: 'Petra Novotná', accountManagerEmail: 'petra.novotna@arena.cz', accountManagerPhone: '+420 602 123 456' },
    seats: { skyboxes: ['SB-05'], clubSections: [] },
    allocationKinds: ['TYPE1'],
    type1Allocation: { skyboxes: ['SB-05'], clubSections: [] },
    benefitBudgetCZK: 0, spentBenefitCZK: 0,
    users: [
      { id: 'user-barbora', partnerId: 'barbora', name: 'Barbora Chaloupecká', email: 'barbora.chaloupecka@skoda-auto.cz', role: 'admin', initials: 'BC', active: true },
    ],
  },
  {
    id: 'ludek', brandId: 'o2arena',
    companyName: 'Kooperativa pojišťovna, a.s.', ico: '47116617',
    address: 'Templová 747, 110 01 Praha 1',
    contactPerson: { firstName: 'Luděk', lastName: 'Procházka', email: 'ludek.prochazka@koop.cz' },
    contract: { id: 'VIP-2023-0047', type: 'Klub Premium', validFrom: '2023-07-01', validTo: '2025-06-30', amountCZK: 850000, accountManagerName: 'Tomáš Říha', accountManagerEmail: 'tomas.riha@arena.cz', accountManagerPhone: '+420 603 456 789' },
    seats: { skyboxes: [], clubSections: ['222'] },
    allocationKinds: ['TYPE1', 'TYPE2', 'TYPE3'],
    type1Allocation: { skyboxes: [], clubSections: ['222'] },
    benefitBudgetCZK: 200000, spentBenefitCZK: 74200,
    users: [
      { id: 'user-ludek', partnerId: 'ludek', name: 'Luděk Procházka', email: 'ludek.prochazka@koop.cz', role: 'admin', initials: 'LP', active: true },
    ],
  },
  {
    id: 'martin', brandId: 'o2arena',
    companyName: 'Hot Peppers s.r.o.', ico: '08941234',
    address: 'Korunní 2569/108, 101 00 Praha 10',
    contactPerson: { firstName: 'Martin', lastName: 'Gremlica', email: 'martin.gremlica@hotpeppers.cz' },
    contract: { id: 'VIP-2025-0012', type: 'Benefit Partner', validFrom: '2025-01-01', validTo: '2025-12-31', amountCZK: 450000, accountManagerName: 'Jana Horáčková', accountManagerEmail: 'jana.horackova@arena.cz', accountManagerPhone: '+420 604 789 012' },
    seats: { skyboxes: [], clubSections: [] },
    allocationKinds: ['TYPE2', 'TYPE3'],
    type1Allocation: { skyboxes: [], clubSections: [] },
    benefitBudgetCZK: 150000, spentBenefitCZK: 32500,
    users: [
      { id: 'user-martin', partnerId: 'martin', name: 'Martin Gremlica', email: 'martin.gremlica@hotpeppers.cz', role: 'admin', initials: 'MG', active: true },
    ],
  },

  // ── T-Arena Brno ──────────────────────────────────────────────────────────
  {
    id: 'partner-csob', brandId: 'tarena',
    companyName: 'ČSOB a.s.', ico: '00001350',
    address: 'Radlická 333/150, 150 57 Praha 5',
    contactPerson: { firstName: 'Tomáš', lastName: 'Blažek', email: 'tomas.blazek@csob.cz' },
    contract: { id: 'VIP-2024-0201', type: 'Premium Skybox', validFrom: '2024-01-01', validTo: '2026-12-31', amountCZK: 980000, accountManagerName: 'Petra Novotná', accountManagerEmail: 'petra.novotna@arena.cz', accountManagerPhone: '+420 602 123 456' },
    seats: { skyboxes: ['SB-02'], clubSections: [] },
    allocationKinds: ['TYPE1'],
    type1Allocation: { skyboxes: ['SB-02'], clubSections: [] },
    benefitBudgetCZK: 0, spentBenefitCZK: 0,
    users: [
      { id: 'user-csob', partnerId: 'partner-csob', name: 'Tomáš Blažek', email: 'tomas.blazek@csob.cz', role: 'admin', initials: 'TB', active: true },
    ],
  },
  {
    id: 'partner-zbrojovka', brandId: 'tarena',
    companyName: 'Zbrojovka Brno Sponsor s.r.o.', ico: '27654321',
    address: 'Středová 2, 602 00 Brno',
    contactPerson: { firstName: 'Radek', lastName: 'Horáček', email: 'radek.horacek@zbrojovka-partner.cz' },
    contract: { id: 'VIP-2024-0215', type: 'Benefit Partner', validFrom: '2024-06-01', validTo: '2025-05-31', amountCZK: 320000, accountManagerName: 'Tomáš Říha', accountManagerEmail: 'tomas.riha@arena.cz', accountManagerPhone: '+420 603 456 789' },
    seats: { skyboxes: [], clubSections: [] },
    allocationKinds: ['TYPE2', 'TYPE3'],
    type1Allocation: { skyboxes: [], clubSections: [] },
    benefitBudgetCZK: 120000, spentBenefitCZK: 18000,
    users: [
      { id: 'user-zbrojovka', partnerId: 'partner-zbrojovka', name: 'Radek Horáček', email: 'radek.horacek@zbrojovka-partner.cz', role: 'admin', initials: 'RH', active: true },
    ],
  },

  // ── Slavia / Fortuna Arena ─────────────────────────────────────────────────
  {
    id: 'partner-fortuna', brandId: 'slavia',
    companyName: 'Fortuna Entertainment Group', ico: '27776001',
    address: 'Pankrác 1658/121, 140 00 Praha 4',
    contactPerson: { firstName: 'Jakub', lastName: 'Šimánek', email: 'jakub.simanek@fortuna.cz' },
    contract: { id: 'VIP-2024-0301', type: 'Premium Skybox', validFrom: '2024-08-01', validTo: '2027-07-31', amountCZK: 1400000, accountManagerName: 'Petra Novotná', accountManagerEmail: 'petra.novotna@arena.cz', accountManagerPhone: '+420 602 123 456' },
    seats: { skyboxes: ['SB-01'], clubSections: [] },
    allocationKinds: ['TYPE1'],
    type1Allocation: { skyboxes: ['SB-01'], clubSections: [] },
    benefitBudgetCZK: 0, spentBenefitCZK: 0,
    users: [
      { id: 'user-fortuna', partnerId: 'partner-fortuna', name: 'Jakub Šimánek', email: 'jakub.simanek@fortuna.cz', role: 'admin', initials: 'JŠ', active: true },
    ],
  },
  {
    id: 'partner-prazdroj', brandId: 'slavia',
    companyName: 'Plzeňský Prazdroj, a.s.', ico: '45357366',
    address: 'U Prazdroje 64/7, 301 00 Plzeň',
    contactPerson: { firstName: 'Ondřej', lastName: 'Kovář', email: 'ondrej.kovar@prazdroj.cz' },
    contract: { id: 'VIP-2025-0088', type: 'Klub Premium', validFrom: '2025-01-01', validTo: '2026-12-31', amountCZK: 680000, accountManagerName: 'Jana Horáčková', accountManagerEmail: 'jana.horackova@arena.cz', accountManagerPhone: '+420 604 789 012' },
    seats: { skyboxes: [], clubSections: ['210'] },
    allocationKinds: ['TYPE1', 'TYPE2'],
    type1Allocation: { skyboxes: [], clubSections: ['210'] },
    benefitBudgetCZK: 180000, spentBenefitCZK: 45000,
    users: [
      { id: 'user-prazdroj', partnerId: 'partner-prazdroj', name: 'Ondřej Kovář', email: 'ondrej.kovar@prazdroj.cz', role: 'admin', initials: 'OK', active: true },
    ],
  },

  // ── PLG Venues ─────────────────────────────────────────────────────────────
  {
    id: 'partner-moneta', brandId: 'default',
    companyName: 'Moneta Money Bank, a.s.', ico: '25672720',
    address: 'Vyskočilova 1422/1a, 140 28 Praha 4',
    contactPerson: { firstName: 'Petra', lastName: 'Dvořáčková', email: 'petra.dvorackova@moneta.cz' },
    contract: { id: 'VIP-2024-0401', type: 'Premium Skybox', validFrom: '2024-03-01', validTo: '2026-02-28', amountCZK: 750000, accountManagerName: 'Tomáš Říha', accountManagerEmail: 'tomas.riha@arena.cz', accountManagerPhone: '+420 603 456 789' },
    seats: { skyboxes: ['SB-03'], clubSections: [] },
    allocationKinds: ['TYPE1'],
    type1Allocation: { skyboxes: ['SB-03'], clubSections: [] },
    benefitBudgetCZK: 0, spentBenefitCZK: 0,
    users: [
      { id: 'user-moneta', partnerId: 'partner-moneta', name: 'Petra Dvořáčková', email: 'petra.dvorackova@moneta.cz', role: 'admin', initials: 'PD', active: true },
    ],
  },
  {
    id: 'partner-o2', brandId: 'default',
    companyName: 'O2 Czech Republic a.s.', ico: '60193336',
    address: 'Za Brumlovkou 266/2, 140 22 Praha 4',
    contactPerson: { firstName: 'Václav', lastName: 'Nový', email: 'vaclav.novy@o2.cz' },
    contract: { id: 'VIP-2025-0155', type: 'Benefit Partner', validFrom: '2025-01-01', validTo: '2025-12-31', amountCZK: 290000, accountManagerName: 'Petra Novotná', accountManagerEmail: 'petra.novotna@arena.cz', accountManagerPhone: '+420 602 123 456' },
    seats: { skyboxes: [], clubSections: [] },
    allocationKinds: ['TYPE2', 'TYPE3'],
    type1Allocation: { skyboxes: [], clubSections: [] },
    benefitBudgetCZK: 100000, spentBenefitCZK: 12000,
    users: [
      { id: 'user-o2', partnerId: 'partner-o2', name: 'Václav Nový', email: 'vaclav.novy@o2.cz', role: 'admin', initials: 'VN', active: true },
    ],
  },
]

// ─── Local cache (sync reads) ─────────────────────────────────────────────────

function loadLocal() {
  try {
    const raw = localStorage.getItem(STORE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function saveLocal(partners) {
  localStorage.setItem(STORE_KEY, JSON.stringify(partners))
}

// ─── Remote (Upstash via /api/partners) ──────────────────────────────────────

async function loadRemote() {
  try {
    const r = await fetch(API)
    if (!r.ok) return null
    const data = await r.json()
    return Array.isArray(data) ? data : null
  } catch { return null }
}

function saveRemote(partners) {
  fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(partners),
  }).catch(() => {}) // fire-and-forget
}

// ─── Unified read/write ───────────────────────────────────────────────────────

function loadAll() {
  return loadLocal() || []
}

function saveAll(partners) {
  saveLocal(partners)
  saveRemote(partners)
}

// ─── Init — hydrate from Upstash, seed if empty ───────────────────────────────

export async function initPartnerStore() {
  const remote = await loadRemote()

  if (remote === null) {
    // Server unavailable — use local cache or seed locally
    if (!loadLocal()) saveLocal(SEED_PARTNERS)
    return
  }

  if (remote.length > 0) {
    // Server has data — use it as source of truth
    saveLocal(remote)
    return
  }

  // Server is empty — seed both local and remote
  saveLocal(SEED_PARTNERS)
  saveRemote(SEED_PARTNERS)
}

// ─── Read ─────────────────────────────────────────────────────────────────────

export function getAllPartners() {
  return loadAll()
}

export function getPartnersByBrand(brandId) {
  return loadAll().filter(p => p.brandId === brandId)
}

export function getPartner(id) {
  return loadAll().find(p => p.id === id) || null
}

export function getUserById(userId) {
  for (const partner of loadAll()) {
    const user = (partner.users || []).find(u => u.id === userId)
    if (user) return user
  }
  return null
}

export function getPartnerByUserId(userId) {
  return loadAll().find(p => (p.users || []).some(u => u.id === userId)) || null
}

// ─── Write ────────────────────────────────────────────────────────────────────

export function savePartner(partner) {
  const all = loadAll()
  const idx = all.findIndex(p => p.id === partner.id)
  if (idx >= 0) {
    all[idx] = partner
  } else {
    all.push(partner)
  }
  saveAll(all)
}

export function deletePartner(id) {
  saveAll(loadAll().filter(p => p.id !== id))
}

export function generatePartnerId() {
  return `partner-${Date.now()}`
}
