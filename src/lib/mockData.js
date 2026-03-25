import { getPublishedEvents, getEvent as storeGetEvent } from '@/lib/eventStore'
import { getUserById as getStoreUser, getPartner as getStorePartner } from '@/lib/partnerStore'

/**
 * Complete mock data for the VIP Partner Portal.
 * Three personas with different allocation types.
 *
 * AllocationKind:
 *   TYPE1 — Contracted skybox/club seats; always 3 mandatory payments per event:
 *            1) Venue rental  2) Catering  3) Transaction fee (%)
 *   TYPE2 — Benefit tickets; free (deducted from benefitBudget); active claim required
 *   TYPE3 — Benefit tickets; free (deducted from benefitBudget); auto-assigned
 */

// ─── CATERING ADD-ONS ──────────────────────────────────────────────────────────
export const CATERING_ADDONS = [
  {
    id: 'wine-selection',
    name: 'Výběr vín',
    nameEn: 'Wine selection',
    description: 'Výběr 3 lahví prémiového vína',
    pricePerUnit: 2400,
    unit: 'výběr',
    unitEn: 'selection',
    icon: '🍷',
  },
  {
    id: 'premium-catering',
    name: 'Premium catering balíček',
    nameEn: 'Premium catering package',
    description: 'Rozšířené občerstvení pro celou skupinu',
    pricePerUnit: 3800,
    unit: 'balíček',
    unitEn: 'package',
    icon: '🍽️',
  },
  {
    id: 'vip-service',
    name: 'VIP servis',
    nameEn: 'VIP service',
    description: 'Osobní číšník po celou dobu akce',
    pricePerUnit: 1500,
    unit: 'akce',
    unitEn: 'event',
    icon: '⭐',
  },
  {
    id: 'welcome-package',
    name: 'Uvítací balíček',
    nameEn: 'Welcome package',
    description: 'Uvítací drink a malé občerstvení na příchod',
    pricePerUnit: 800,
    unit: 'osoba',
    unitEn: 'person',
    icon: '🥂',
  },
  {
    id: 'parking',
    name: 'VIP Parkování',
    nameEn: 'VIP Parking',
    description: 'Vyhrazené parkovací místo v podzemním parkovišti',
    pricePerUnit: 600,
    unit: 'místo',
    unitEn: 'space',
    icon: '🅿️',
  },
]

// ─── ARENA MAP DEFINITION ──────────────────────────────────────────────────────
// Club sections (2xx) in the arena
// 26 club sections: 201–226, each with 6 rows × 12 seats
export const CLUB_SECTIONS = Object.fromEntries(
  Array.from({ length: 26 }, (_, i) => {
    const id = String(201 + i)
    return [id, { id, label: `Sek. ${id}`, rows: 6, seatsPerRow: 12 }]
  })
)

// 28 skyboxes: SB-01–SB-28 (one per outer-ring segment)
export const SKYBOXES = Object.fromEntries(
  Array.from({ length: 28 }, (_, i) => {
    const num = String(i + 1).padStart(2, '0')
    const id = `SB-${num}`
    return [id, { id, label: `Skybox ${num}`, capacity: 10, floor: 3 }]
  })
)

// Generate seat unavailability (random ~20% per section, stable)
function genUnavailable(sectionId, rows, seatsPerRow) {
  const unavailable = new Set()
  const seed = sectionId.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  for (let r = 1; r <= rows; r++) {
    for (let s = 1; s <= seatsPerRow; s++) {
      if ((seed * r * s) % 7 === 0) {
        unavailable.add(`${r}-${s}`)
      }
    }
  }
  return unavailable
}

export const SECTION_UNAVAILABLE = Object.fromEntries(
  Array.from({ length: 26 }, (_, i) => [String(201 + i), genUnavailable(String(201 + i), 6, 12)])
)

// ─── PARTNERS ──────────────────────────────────────────────────────────────────
export const PARTNERS = {
  barbora: {
    id: 'barbora',
    brandId: 'o2arena',
    userId: 'user-barbora',
    companyName: 'ŠKODA Auto a.s.',
    ico: '00177041',
    address: 'tř. Václava Klementa 869, 293 01 Mladá Boleslav',
    contactPerson: {
      firstName: 'Barbora',
      lastName: 'Chaloupecká',
      email: 'barbora.chaloupecka@skoda-auto.cz',
    },
    contract: {
      id: 'VIP-2024-0089',
      type: 'Premium Skybox',
      validFrom: '2024-01-01',
      validTo: '2026-12-31',
      amountCZK: 1200000,
      accountManagerName: 'Petra Novotná',
      accountManagerEmail: 'petra.novotna@arena.cz',
      accountManagerPhone: '+420 602 123 456',
    },
    seats: { skyboxes: ['SB-05'], clubSections: [] },
    allocationKinds: ['TYPE1'],
    type1Allocation: {
      skyboxes: ['SB-05'],
      clubSections: [],
    },
    benefitBudgetCZK: 0,
    spentBenefitCZK: 0,
  },
  ludek: {
    id: 'ludek',
    brandId: 'o2arena',
    userId: 'user-ludek',
    companyName: 'Kooperativa pojišťovna, a.s.',
    ico: '47116617',
    address: 'Templová 747, 110 01 Praha 1',
    contactPerson: {
      firstName: 'Luděk',
      lastName: 'Procházka',
      email: 'ludek.prochazka@koop.cz',
    },
    contract: {
      id: 'VIP-2023-0047',
      type: 'Klub Premium',
      validFrom: '2023-07-01',
      validTo: '2025-06-30',
      amountCZK: 850000,
      accountManagerName: 'Tomáš Říha',
      accountManagerEmail: 'tomas.riha@arena.cz',
      accountManagerPhone: '+420 603 456 789',
    },
    seats: { skyboxes: [], clubSections: ['222'] },
    allocationKinds: ['TYPE1', 'TYPE2', 'TYPE3'],
    type1Allocation: {
      skyboxes: [],
      clubSections: ['222'],
    },
    benefitBudgetCZK: 200000,
    spentBenefitCZK: 74200,
  },
  martin: {
    id: 'martin',
    brandId: 'o2arena',
    userId: 'user-martin',
    companyName: 'Hot Peppers s.r.o.',
    ico: '08941234',
    address: 'Korunní 2569/108, 101 00 Praha 10',
    contactPerson: {
      firstName: 'Martin',
      lastName: 'Gremlica',
      email: 'martin.gremlica@hotpeppers.cz',
    },
    contract: {
      id: 'VIP-2025-0012',
      type: 'Benefit Partner',
      validFrom: '2025-01-01',
      validTo: '2025-12-31',
      amountCZK: 450000,
      accountManagerName: 'Jana Horáčková',
      accountManagerEmail: 'jana.horackova@arena.cz',
      accountManagerPhone: '+420 605 789 012',
    },
    seats: { skyboxes: [], clubSections: ['209'] },
    allocationKinds: ['TYPE2', 'TYPE3'],
    type1Allocation: null,
    benefitBudgetCZK: 150000,
    spentBenefitCZK: 42500,
  },
}

// ─── USERS ─────────────────────────────────────────────────────────────────────
export const USERS = {
  'user-barbora': {
    id: 'user-barbora',
    partnerId: 'barbora',
    name: 'Barbora Chaloupecká',
    email: 'barbora.chaloupecka@skoda-auto.cz',
    role: 'admin',
    initials: 'BC',
    active: true,
  },
  'user-ludek': {
    id: 'user-ludek',
    partnerId: 'ludek',
    name: 'Luděk Procházka',
    email: 'ludek.prochazka@koop.cz',
    role: 'admin',
    initials: 'LP',
    active: true,
  },
  'user-martin': {
    id: 'user-martin',
    partnerId: 'martin',
    name: 'Martin Gremlica',
    email: 'martin.gremlica@hotpeppers.cz',
    role: 'admin',
    initials: 'MG',
    active: true,
  },
}

// ─── ADMIN USERS (arena employees) ────────────────────────────────────────────
export const ADMIN_USERS = [
  {
    id: 'admin-petra',
    name: 'Petra Novotná',
    email: 'petra.novotna@arena.cz',
    password: 'admin123',
    initials: 'PN',
    role: 'arena_admin',
  },
  {
    id: 'admin-tomas',
    name: 'Tomáš Říha',
    email: 'tomas.riha@arena.cz',
    password: 'admin123',
    initials: 'TR',
    role: 'arena_admin',
  },
]

// Extra users per partner (for Users tab)
export const PARTNER_USERS = {
  barbora: [
    USERS['user-barbora'],
    { id: 'u-b2', partnerId: 'barbora', name: 'Kateřina Malá', email: 'katerina.mala@skoda-auto.cz', role: 'user', initials: 'KM', active: true },
    { id: 'u-b3', partnerId: 'barbora', name: 'Josef Kratochvíl', email: 'josef.kratochvil@skoda-auto.cz', role: 'user', initials: 'JK', active: false },
  ],
  ludek: [
    USERS['user-ludek'],
    { id: 'u-l2', partnerId: 'ludek', name: 'Alena Horáčková', email: 'alena.horackova@koop.cz', role: 'user', initials: 'AH', active: true },
    { id: 'u-l3', partnerId: 'ludek', name: 'Pavel Šimánek', email: 'pavel.simanek@koop.cz', role: 'user', initials: 'PŠ', active: true },
    { id: 'u-l4', partnerId: 'ludek', name: 'Radka Nováková', email: 'radka.novakova@koop.cz', role: 'user', initials: 'RN', active: false },
  ],
  martin: [
    USERS['user-martin'],
    { id: 'u-m2', partnerId: 'martin', name: 'Eva Procházková', email: 'eva.prochazova@hotpeppers.cz', role: 'user', initials: 'EP', active: true },
  ],
}

// ─── EVENTS ────────────────────────────────────────────────────────────────────
const now = new Date()
function daysFromNow(d) {
  return new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString()
}

export const EVENTS = [
  {
    id: 'ev-001',
    name: 'Hokejové MS 2026 — Česko vs. Kanada',
    subtitle: 'IIHF World Championship',
    category: 'HOCKEY',
    date: daysFromNow(18),
    doorsOpen: daysFromNow(18),
    imageColor: '#0f4c8c',
  },
  {
    id: 'ev-002',
    name: 'Coldplay — Music of the Spheres World Tour',
    subtitle: 'Chris Martin & kapela',
    category: 'CONCERT',
    date: daysFromNow(31),
    doorsOpen: daysFromNow(31),
    imageColor: '#7c3aed',
  },
  {
    id: 'ev-003',
    name: 'NBA Global Games — Bulls vs. Bucks',
    subtitle: 'Chicago Bulls vs. Milwaukee Bucks',
    category: 'BASKETBALL',
    date: daysFromNow(45),
    doorsOpen: daysFromNow(45),
    imageColor: '#b91c1c',
  },
  {
    id: 'ev-004',
    name: 'Metallica — M72 World Tour',
    subtitle: 'Special guests: Pantera',
    category: 'CONCERT',
    date: daysFromNow(62),
    doorsOpen: daysFromNow(62),
    imageColor: '#1c1c1c',
  },
  {
    id: 'ev-005',
    name: 'Hokej — Sparta vs. Třinec',
    subtitle: 'Extraliga, 34. kolo',
    category: 'HOCKEY',
    date: daysFromNow(9),
    doorsOpen: daysFromNow(9),
    imageColor: '#c2410c',
  },
  {
    id: 'ev-006',
    name: 'Billie Eilish — Hit Me Hard and Soft Tour',
    subtitle: 'World Tour 2026',
    category: 'CONCERT',
    date: daysFromNow(78),
    doorsOpen: daysFromNow(78),
    imageColor: '#064e3b',
  },
  {
    id: 'ev-007',
    name: 'Hokej — Finále Extraligy — Utkání 3',
    subtitle: 'Finálová série 2026',
    category: 'HOCKEY',
    date: daysFromNow(5),
    doorsOpen: daysFromNow(5),
    imageColor: '#1d4ed8',
  },
]

// ─── EVENT ALLOCATIONS per partner ────────────────────────────────────────────
/**
 * For each (partnerId, eventId), define what allocations they have.
 * Multiple allocations per event possible (e.g., TYPE1 + TYPE2).
 */
export const EVENT_ALLOCATIONS = {
  // BARBORA — TYPE1 only (skybox SB-05)
  'barbora:ev-001': [
    {
      id: 'ea-b-001',
      eventId: 'ev-001',
      partnerId: 'barbora',
      kind: 'TYPE1',
      status: 'OPTION_PENDING',
      optionDeadline: daysFromNow(4),
      skyboxes: ['SB-05'],
      clubSections: [],
      venueFeeCZKPerSkybox: 28000,
      venueFeeCZKPerSeat: null,
      cateringFeeCZKPerSeat: 1200,
      transactionFeePercent: 5,
    },
  ],
  'barbora:ev-002': [
    {
      id: 'ea-b-002',
      eventId: 'ev-002',
      partnerId: 'barbora',
      kind: 'TYPE1',
      status: 'OPTION_PENDING',
      optionDeadline: daysFromNow(14),
      skyboxes: ['SB-05'],
      clubSections: [],
      venueFeeCZKPerSkybox: 34000,
      venueFeeCZKPerSeat: null,
      cateringFeeCZKPerSeat: 1200,
      transactionFeePercent: 5,
    },
  ],
  'barbora:ev-005': [
    {
      id: 'ea-b-005',
      eventId: 'ev-005',
      partnerId: 'barbora',
      kind: 'TYPE1',
      status: 'CONFIRMED',
      optionDeadline: daysFromNow(-2),
      skyboxes: ['SB-05'],
      clubSections: [],
      venueFeeCZKPerSkybox: 24000,
      venueFeeCZKPerSeat: null,
      cateringFeeCZKPerSeat: 1200,
      transactionFeePercent: 5,
    },
  ],
  'barbora:ev-007': [
    {
      id: 'ea-b-007',
      eventId: 'ev-007',
      partnerId: 'barbora',
      kind: 'TYPE1',
      status: 'OPTION_PENDING',
      optionDeadline: daysFromNow(2),
      skyboxes: ['SB-05'],
      clubSections: [],
      venueFeeCZKPerSkybox: 32000,
      venueFeeCZKPerSeat: null,
      cateringFeeCZKPerSeat: 1200,
      transactionFeePercent: 5,
    },
  ],
  'barbora:ev-003': [
    {
      id: 'ea-b-003',
      eventId: 'ev-003',
      partnerId: 'barbora',
      kind: 'TYPE1',
      status: 'LAPSED',
      optionDeadline: daysFromNow(-5),
      skyboxes: ['SB-05'],
      clubSections: [],
      venueFeeCZKPerSkybox: 30000,
      venueFeeCZKPerSeat: null,
      cateringFeeCZKPerSeat: 1200,
      transactionFeePercent: 5,
    },
  ],

  // LUDĚK — TYPE1 (club seats 222) + TYPE2 + TYPE3
  'ludek:ev-001': [
    {
      id: 'ea-l-001-t1',
      eventId: 'ev-001',
      partnerId: 'ludek',
      kind: 'TYPE1',
      status: 'OPTION_PENDING',
      optionDeadline: daysFromNow(4),
      skyboxes: [],
      clubSections: ['222'],
      venueFeeCZKPerSkybox: null,
      venueFeeCZKPerSeat: 1800,
      cateringFeeCZKPerSeat: 1200,
      transactionFeePercent: 5,
    },
    {
      id: 'ea-l-001-t2',
      eventId: 'ev-001',
      partnerId: 'ludek',
      kind: 'TYPE2',
      status: 'OPTION_PENDING',
      optionDeadline: daysFromNow(4),
      benefitValueCZK: 890,
      availableCount: 4,
    },
  ],
  'ludek:ev-002': [
    {
      id: 'ea-l-002-t1',
      eventId: 'ev-002',
      partnerId: 'ludek',
      kind: 'TYPE1',
      status: 'CONFIRMED',
      optionDeadline: daysFromNow(-3),
      skyboxes: [],
      clubSections: ['222'],
      venueFeeCZKPerSkybox: null,
      venueFeeCZKPerSeat: 2200,
      cateringFeeCZKPerSeat: 1200,
      transactionFeePercent: 5,
    },
    {
      id: 'ea-l-002-t3',
      eventId: 'ev-002',
      partnerId: 'ludek',
      kind: 'TYPE3',
      status: 'AUTO_CONFIRMED',
      optionDeadline: null,
      benefitValueCZK: 1100,
      availableCount: 2,
    },
  ],
  'ludek:ev-005': [
    {
      id: 'ea-l-005-t1',
      eventId: 'ev-005',
      partnerId: 'ludek',
      kind: 'TYPE1',
      status: 'OPTION_PENDING',
      optionDeadline: daysFromNow(3),
      skyboxes: [],
      clubSections: ['222'],
      venueFeeCZKPerSkybox: null,
      venueFeeCZKPerSeat: 1500,
      cateringFeeCZKPerSeat: 1200,
      transactionFeePercent: 5,
    },
    {
      id: 'ea-l-005-t2',
      eventId: 'ev-005',
      partnerId: 'ludek',
      kind: 'TYPE2',
      status: 'OPTION_PENDING',
      optionDeadline: daysFromNow(3),
      benefitValueCZK: 750,
      availableCount: 3,
    },
  ],
  'ludek:ev-007': [
    {
      id: 'ea-l-007-t1',
      eventId: 'ev-007',
      partnerId: 'ludek',
      kind: 'TYPE1',
      status: 'OPTION_PENDING',
      optionDeadline: daysFromNow(1),
      skyboxes: [],
      clubSections: ['222'],
      venueFeeCZKPerSkybox: null,
      venueFeeCZKPerSeat: 2500,
      cateringFeeCZKPerSeat: 1200,
      transactionFeePercent: 5,
    },
  ],

  // MARTIN — TYPE2 + TYPE3 only
  'martin:ev-001': [
    {
      id: 'ea-m-001-t2',
      eventId: 'ev-001',
      partnerId: 'martin',
      kind: 'TYPE2',
      status: 'OPTION_PENDING',
      optionDeadline: daysFromNow(4),
      benefitValueCZK: 890,
      availableCount: 6,
    },
    {
      id: 'ea-m-001-t3',
      eventId: 'ev-001',
      partnerId: 'martin',
      kind: 'TYPE3',
      status: 'AUTO_CONFIRMED',
      optionDeadline: null,
      benefitValueCZK: 890,
      availableCount: 4,
    },
  ],
  'martin:ev-002': [
    {
      id: 'ea-m-002-t2',
      eventId: 'ev-002',
      partnerId: 'martin',
      kind: 'TYPE2',
      status: 'OPTION_PENDING',
      optionDeadline: daysFromNow(14),
      benefitValueCZK: 1100,
      availableCount: 4,
    },
    {
      id: 'ea-m-002-t3',
      eventId: 'ev-002',
      partnerId: 'martin',
      kind: 'TYPE3',
      status: 'AUTO_CONFIRMED',
      optionDeadline: null,
      benefitValueCZK: 1100,
      availableCount: 2,
    },
  ],
  'martin:ev-005': [
    {
      id: 'ea-m-005-t3',
      eventId: 'ev-005',
      partnerId: 'martin',
      kind: 'TYPE3',
      status: 'AUTO_CONFIRMED',
      optionDeadline: null,
      benefitValueCZK: 750,
      availableCount: 3,
    },
  ],
  'martin:ev-007': [
    {
      id: 'ea-m-007-t2',
      eventId: 'ev-007',
      partnerId: 'martin',
      kind: 'TYPE2',
      status: 'LAPSED',
      optionDeadline: daysFromNow(-1),
      benefitValueCZK: 2500,
      availableCount: 4,
    },
  ],
}

// ─── ORDERS (historical) ───────────────────────────────────────────────────────
export const ORDERS = {
  barbora: [
    {
      id: 'ORD-2025-1142',
      partnerId: 'barbora',
      eventId: 'ev-005',
      eventName: 'Hokej — Sparta vs. Třinec',
      eventDate: daysFromNow(9),
      kind: 'TYPE1',
      items: [{ type: 'SKYBOX', label: 'Skybox SB-05', count: 1 }],
      venueFee: 24000,
      cateringFee: 12000,
      transactionFee: 1800,
      addonsFee: 0,
      totalCZK: 37800,
      status: 'CONFIRMED',
      paymentMethod: 'INVOICE',
      createdAt: daysFromNow(-1),
    },
    {
      id: 'ORD-2025-0987',
      partnerId: 'barbora',
      eventId: 'ev-hist-1',
      eventName: 'Eros Ramazzotti — Farewell Tour',
      eventDate: daysFromNow(-30),
      kind: 'TYPE1',
      items: [{ type: 'SKYBOX', label: 'Skybox SB-05', count: 1 }],
      venueFee: 32000,
      cateringFee: 12000,
      transactionFee: 2200,
      addonsFee: 3800,
      totalCZK: 50000,
      status: 'PAID',
      paymentMethod: 'INVOICE',
      createdAt: daysFromNow(-45),
    },
    {
      id: 'ORD-2025-0844',
      partnerId: 'barbora',
      eventId: 'ev-hist-2',
      eventName: 'NHL Global Games — Rangers vs. Bruins',
      eventDate: daysFromNow(-60),
      kind: 'TYPE1',
      items: [{ type: 'SKYBOX', label: 'Skybox SB-05', count: 1 }],
      venueFee: 38000,
      cateringFee: 12000,
      transactionFee: 2500,
      addonsFee: 5600,
      totalCZK: 58100,
      status: 'PAID',
      paymentMethod: 'INVOICE',
      createdAt: daysFromNow(-75),
    },
  ],
  ludek: [
    {
      id: 'ORD-2025-1201',
      partnerId: 'ludek',
      eventId: 'ev-002',
      eventName: 'Coldplay — Music of the Spheres',
      eventDate: daysFromNow(31),
      kind: 'TYPE1',
      items: [{ type: 'CLUB_SEATS', label: 'Sekce 222', count: 5 }],
      venueFee: 11000,
      cateringFee: 6000,
      transactionFee: 850,
      addonsFee: 2400,
      totalCZK: 20250,
      status: 'CONFIRMED',
      paymentMethod: 'INVOICE',
      createdAt: daysFromNow(-2),
    },
    {
      id: 'ORD-2025-1189',
      partnerId: 'ludek',
      eventId: 'ev-hist-3',
      eventName: 'Imagine Dragons — Loom Tour',
      eventDate: daysFromNow(-15),
      kind: 'TYPE2',
      items: [{ type: 'BENEFIT', label: 'Benefit vstupenky', count: 3 }],
      venueFee: 0,
      cateringFee: 0,
      transactionFee: 0,
      addonsFee: 0,
      benefitValue: 2670,
      totalCZK: 0,
      status: 'PAID',
      paymentMethod: 'INVOICE',
      createdAt: daysFromNow(-30),
    },
  ],
  martin: [
    {
      id: 'ORD-2025-1155',
      partnerId: 'martin',
      eventId: 'ev-005',
      eventName: 'Hokej — Sparta vs. Třinec',
      eventDate: daysFromNow(9),
      kind: 'TYPE3',
      items: [{ type: 'BENEFIT', label: 'Auto-přiřazené benefit vstupenky', count: 3 }],
      venueFee: 0,
      cateringFee: 0,
      transactionFee: 0,
      addonsFee: 0,
      benefitValue: 2250,
      totalCZK: 0,
      status: 'CONFIRMED',
      paymentMethod: null,
      createdAt: daysFromNow(-3),
    },
    {
      id: 'ORD-2025-1098',
      partnerId: 'martin',
      eventId: 'ev-hist-4',
      eventName: 'Harry Styles — Love on Tour',
      eventDate: daysFromNow(-20),
      kind: 'TYPE2',
      items: [{ type: 'BENEFIT', label: 'Benefit vstupenky', count: 4 }],
      venueFee: 0,
      cateringFee: 0,
      transactionFee: 0,
      addonsFee: 0,
      benefitValue: 4400,
      totalCZK: 0,
      status: 'PAID',
      paymentMethod: null,
      createdAt: daysFromNow(-35),
    },
  ],
}

// ─── TICKETS ───────────────────────────────────────────────────────────────────
export const TICKETS_DATA = {
  barbora: [
    { id: 'T-001', orderId: 'ORD-2025-1142', eventName: 'Hokej — Sparta vs. Třinec', seatLabel: 'Skybox SB-05 — místo 1', guestEmail: null, status: 'ASSIGNED' },
    { id: 'T-002', orderId: 'ORD-2025-1142', eventName: 'Hokej — Sparta vs. Třinec', seatLabel: 'Skybox SB-05 — místo 2', guestEmail: 'marie.cermakova@skoda.cz', status: 'SENT' },
    { id: 'T-003', orderId: 'ORD-2025-1142', eventName: 'Hokej — Sparta vs. Třinec', seatLabel: 'Skybox SB-05 — místo 3', guestEmail: null, status: 'ASSIGNED' },
    { id: 'T-004', orderId: 'ORD-2025-1142', eventName: 'Hokej — Sparta vs. Třinec', seatLabel: 'Skybox SB-05 — místo 4', guestEmail: null, status: 'ASSIGNED' },
    { id: 'T-005', orderId: 'ORD-2025-1142', eventName: 'Hokej — Sparta vs. Třinec', seatLabel: 'Skybox SB-05 — místo 5', guestEmail: 'petr.kovar@skoda.cz', status: 'SENT' },
  ],
  ludek: [
    { id: 'T-010', orderId: 'ORD-2025-1201', eventName: 'Coldplay — Music of the Spheres', seatLabel: 'Sek. 222 — Řada A, Sedadlo 3', guestEmail: null, status: 'ASSIGNED' },
    { id: 'T-011', orderId: 'ORD-2025-1201', eventName: 'Coldplay — Music of the Spheres', seatLabel: 'Sek. 222 — Řada A, Sedadlo 4', guestEmail: null, status: 'ASSIGNED' },
    { id: 'T-012', orderId: 'ORD-2025-1201', eventName: 'Coldplay — Music of the Spheres', seatLabel: 'Sek. 222 — Řada B, Sedadlo 1', guestEmail: 'alena.horackova@koop.cz', status: 'SENT' },
    { id: 'T-013', orderId: 'ORD-2025-1201', eventName: 'Coldplay — Music of the Spheres', seatLabel: 'Benefit — řada 205, A-7', guestEmail: null, status: 'ASSIGNED' },
    { id: 'T-014', orderId: 'ORD-2025-1201', eventName: 'Coldplay — Music of the Spheres', seatLabel: 'Benefit — řada 205, A-8', guestEmail: null, status: 'ASSIGNED' },
    { id: 'T-015', orderId: 'ORD-2025-1189', eventName: 'Imagine Dragons — Loom Tour', seatLabel: 'Benefit — sek. 205, B-3', guestEmail: null, status: 'ASSIGNED' },
    { id: 'T-016', orderId: 'ORD-2025-1189', eventName: 'Imagine Dragons — Loom Tour', seatLabel: 'Benefit — sek. 205, B-4', guestEmail: 'pavel.simanek@koop.cz', status: 'SENT' },
    { id: 'T-017', orderId: 'ORD-2025-1189', eventName: 'Imagine Dragons — Loom Tour', seatLabel: 'Benefit — sek. 205, B-5', guestEmail: null, status: 'ASSIGNED' },
  ],
  martin: [
    { id: 'T-020', orderId: 'ORD-2025-1155', eventName: 'Hokej — Sparta vs. Třinec', seatLabel: 'Benefit — sek. 209, A-5', guestEmail: null, status: 'ASSIGNED' },
    { id: 'T-021', orderId: 'ORD-2025-1155', eventName: 'Hokej — Sparta vs. Třinec', seatLabel: 'Benefit — sek. 209, A-6', guestEmail: null, status: 'ASSIGNED' },
    { id: 'T-022', orderId: 'ORD-2025-1155', eventName: 'Hokej — Sparta vs. Třinec', seatLabel: 'Benefit — sek. 209, A-7', guestEmail: 'eva.prochazova@hotpeppers.cz', status: 'SENT' },
  ],
}

// ─── REPORTING DATA ────────────────────────────────────────────────────────────
export const REPORTING_DATA = {
  barbora: [
    { eventName: 'Eros Ramazzotti', eventDate: daysFromNow(-30), allocated: 1, claimed: 1, auto: 0, released: 0, lapsed: 0 },
    { eventName: 'NHL — Rangers vs. Bruins', eventDate: daysFromNow(-60), allocated: 1, claimed: 1, auto: 0, released: 0, lapsed: 0 },
    { eventName: 'NBA — Celtics vs. Heat', eventDate: daysFromNow(-90), allocated: 1, claimed: 0, auto: 0, released: 0, lapsed: 1 },
    { eventName: 'Hokej — Sparta vs. Třinec', eventDate: daysFromNow(9), allocated: 1, claimed: 1, auto: 0, released: 0, lapsed: 0 },
  ],
  ludek: [
    { eventName: 'Imagine Dragons', eventDate: daysFromNow(-15), allocated: 5, claimed: 3, auto: 2, released: 0, lapsed: 0 },
    { eventName: 'Depeche Mode', eventDate: daysFromNow(-45), allocated: 5, claimed: 5, auto: 0, released: 0, lapsed: 0 },
    { eventName: 'Finále extraligy', eventDate: daysFromNow(-75), allocated: 5, claimed: 2, auto: 1, released: 1, lapsed: 1 },
    { eventName: 'Coldplay', eventDate: daysFromNow(31), allocated: 5, claimed: 5, auto: 2, released: 0, lapsed: 0 },
  ],
  martin: [
    { eventName: 'Harry Styles', eventDate: daysFromNow(-20), allocated: 6, claimed: 4, auto: 3, released: 0, lapsed: 2 },
    { eventName: 'Beyoncé', eventDate: daysFromNow(-50), allocated: 4, claimed: 4, auto: 2, released: 0, lapsed: 0 },
    { eventName: 'Hokej — Sparta vs. Třinec', eventDate: daysFromNow(9), allocated: 3, claimed: 0, auto: 3, released: 0, lapsed: 0 },
  ],
}

// ─── MOCK SESSION ──────────────────────────────────────────────────────────────
let _currentUserId = null

export function setMockSession(userId) {
  _currentUserId = userId
  localStorage.setItem('vip_session', userId)
}

export function getMockSession() {
  if (_currentUserId) return _currentUserId
  const stored = localStorage.getItem('vip_session')
  if (stored && (USERS[stored] || getStoreUser(stored))) {
    _currentUserId = stored
    return stored
  }
  return null
}

export function clearMockSession() {
  _currentUserId = null
  localStorage.removeItem('vip_session')
}

export function getCurrentUser() {
  const uid = getMockSession()
  if (!uid) return null
  return USERS[uid] || getStoreUser(uid) || null
}

export function getCurrentPartner() {
  const user = getCurrentUser()
  if (!user) return null
  return PARTNERS[user.partnerId] || getStorePartner(user.partnerId) || null
}

// ─── ADMIN SESSION ─────────────────────────────────────────────────────────────
let _adminUserId = null

export function setAdminSession(userId) {
  _adminUserId = userId
  localStorage.setItem('admin_session', userId)
}

export function getAdminSession() {
  if (_adminUserId) return ADMIN_USERS.find(u => u.id === _adminUserId) || null
  const stored = localStorage.getItem('admin_session')
  if (stored) {
    const user = ADMIN_USERS.find(u => u.id === stored)
    if (user) { _adminUserId = stored; return user }
  }
  return null
}

export function clearAdminSession() {
  _adminUserId = null
  localStorage.removeItem('admin_session')
  localStorage.removeItem('admin_brand')
}

// ─── REPOSITORY FUNCTIONS ─────────────────────────────────────────────────────
const delay = (ms = 200) => new Promise(r => setTimeout(r, ms))

export async function getEventsForPartner(partnerId, brandKey) {
  await delay()
  const partner = PARTNERS[partnerId] || getStorePartner(partnerId)
  if (!partner) return []

  const brandEvents = getPublishedEvents(brandKey || 'o2arena')

  // Collect all event IDs this partner has allocations for
  const eventIds = new Set()
  Object.keys(EVENT_ALLOCATIONS).forEach(key => {
    const [pid, eid] = key.split(':')
    if (pid === partnerId) eventIds.add(eid)
  })

  return brandEvents
    .map(event => {
      const allocKey = `${partnerId}:${event.id}`
      let allocations = EVENT_ALLOCATIONS[allocKey] || []

      // Auto-generate TYPE1 allocation from contracted seats when no explicit record exists
      if (allocations.length === 0 && partner.allocationKinds?.includes('TYPE1') && partner.type1Allocation) {
        const t1 = partner.type1Allocation
        if ((t1.skyboxes?.length > 0) || (t1.clubSections?.length > 0)) {
          const eventDate = new Date(event.date)
          const deadlineDate = new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000)
          const autoAlloc = {
            id: `ea-auto-${partnerId}-${event.id}`,
            eventId: event.id,
            partnerId,
            kind: 'TYPE1',
            status: deadlineDate < new Date() ? 'LAPSED' : 'OPTION_PENDING',
            optionDeadline: deadlineDate.toISOString(),
            skyboxes: t1.skyboxes || [],
            clubSections: t1.clubSections || [],
            venueFeeCZKPerSkybox: t1.skyboxes?.length > 0 ? 28000 : null,
            venueFeeCZKPerSeat: t1.clubSections?.length > 0 ? 1500 : null,
            cateringFeeCZKPerSeat: 1200,
            transactionFeePercent: 5,
          }
          allocations = [autoAlloc]
        }
      }

      // Events with no allocations still appear — shown as informational
      if (allocations.length === 0) {
        return { ...event, allocations: [], displayStatus: 'INFO', soonestDeadline: null }
      }

      const hasAuto = allocations.some(a => a.kind === 'TYPE3' && a.status === 'AUTO_CONFIRMED')
      const hasPending = allocations.some(a => a.status === 'OPTION_PENDING')
      const hasConfirmed = allocations.some(a => a.status === 'CONFIRMED')
      const allLapsed = allocations.every(a => a.status === 'LAPSED')

      let displayStatus = 'OPTION_PENDING'
      if (allLapsed) displayStatus = 'LAPSED'
      else if (hasConfirmed && !hasPending) displayStatus = 'CONFIRMED'
      else if (hasAuto && !hasPending) displayStatus = 'AUTO_CONFIRMED'
      else if (hasPending) displayStatus = 'OPTION_PENDING'

      const deadlines = allocations
        .filter(a => a.optionDeadline && a.status === 'OPTION_PENDING')
        .map(a => new Date(a.optionDeadline))
      const soonestDeadline = deadlines.length
        ? new Date(Math.min(...deadlines))
        : null

      return { ...event, allocations, displayStatus, soonestDeadline }
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

export async function getEventDetail(eventId) {
  await delay()
  return storeGetEvent(eventId) || null
}

export async function getEventAllocations(partnerId, eventId) {
  await delay()
  const explicit = EVENT_ALLOCATIONS[`${partnerId}:${eventId}`]
  if (explicit) return explicit

  // Fall back to auto-generating from contracted seats
  const partner = PARTNERS[partnerId] || getStorePartner(partnerId)
  if (partner?.allocationKinds?.includes('TYPE1') && partner.type1Allocation) {
    const t1 = partner.type1Allocation
    if ((t1.skyboxes?.length > 0) || (t1.clubSections?.length > 0)) {
      const event = storeGetEvent(eventId)
      const eventDate = event ? new Date(event.date) : new Date()
      const deadlineDate = new Date(eventDate.getTime() - 7 * 24 * 60 * 60 * 1000)
      return [{
        id: `ea-auto-${partnerId}-${eventId}`,
        eventId,
        partnerId,
        kind: 'TYPE1',
        status: deadlineDate < new Date() ? 'LAPSED' : 'OPTION_PENDING',
        optionDeadline: deadlineDate.toISOString(),
        skyboxes: t1.skyboxes || [],
        clubSections: t1.clubSections || [],
        venueFeeCZKPerSkybox: t1.skyboxes?.length > 0 ? 28000 : null,
        venueFeeCZKPerSeat: t1.clubSections?.length > 0 ? 1500 : null,
        cateringFeeCZKPerSeat: 1200,
        transactionFeePercent: 5,
      }]
    }
  }
  return []
}

export async function getOrders(partnerId) {
  await delay()
  return ORDERS[partnerId] || []
}

export async function getTickets(partnerId) {
  await delay()
  // Return mutable copy (for in-memory updates)
  return [...(TICKETS_DATA[partnerId] || [])]
}

export async function getPartner(partnerId) {
  await delay()
  return PARTNERS[partnerId] || getStorePartner(partnerId) || null
}

export async function getPartnerUsers(partnerId) {
  await delay()
  return PARTNER_USERS[partnerId] || []
}

export async function getReporting(partnerId) {
  await delay()
  return REPORTING_DATA[partnerId] || []
}

export async function createOrder(payload) {
  await delay(800) // Longer for order creation
  const id = `ORD-2026-${Math.floor(1000 + Math.random() * 9000)}`
  return { id, ...payload, status: 'CONFIRMED', createdAt: new Date().toISOString() }
}
