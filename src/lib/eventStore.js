/**
 * Event store — localStorage-based CRUD for brand-scoped events.
 * Admin writes here; B2B SPA reads published events here.
 *
 * Event shape:
 * {
 *   id, brandKey, name, subtitle, category, description,
 *   imageUrl, imageColor, date (ISO), doorsOpen (ISO),
 *   additionalDates: [{date, doorsOpen}],
 *   venue: {name, address, city},
 *   organizer, prices: [{label, amount}],
 *   downloads: [{label, url}],
 *   homeAway: 'home'|'away'|null,
 *   published, createdAt, updatedAt
 * }
 */

const EVENTS_KEY = 'vip_events'
const SEED_VERSION_KEY = 'vip_seed_v'
const CURRENT_VERSION = '3'

function sd(days, hour = 19, min = 0) {
  const d = new Date()
  d.setDate(d.getDate() + days)
  d.setHours(hour, min, 0, 0)
  return d.toISOString()
}

const ts = new Date().toISOString()

const SEED_EVENTS = [
  // ── O2 ARENA ──────────────────────────────────────────────────────────────────
  {
    id: 'ev-007',
    brandKey: 'o2arena',
    name: 'HC Sparta Praha vs. HC Dynamo Pardubice',
    subtitle: 'Tipsport extraliga — 28. kolo',
    category: 'HOCKEY',
    description: 'Tipsport extraliga v O2 Areně. Domácí Sparta přivítá odvěkého rivala Pardubice v nabitém programu extraligové sezóny. Napínavý souboj dvou hokejových velmocí zaručuje perfektní atmosféru v hledišti.',
    imageUrl: null,
    imageColor: '#1d4ed8',
    date: sd(5, 19, 0),
    doorsOpen: sd(5, 17, 30),
    additionalDates: [],
    venue: { name: 'O2 Arena Praha', address: 'Českomoravská 17', city: 'Praha 9' },
    organizer: 'HC Sparta Praha',
    prices: [
      { label: 'VIP Skybox (10 osob)', amount: 32000 },
      { label: 'Klubové sedadlo', amount: 2500 },
    ],
    downloads: [],
    homeAway: 'home',
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-005',
    brandKey: 'o2arena',
    name: 'HC Sparta Praha vs. HC Oceláři Třinec',
    subtitle: 'Tipsport extraliga — 30. kolo',
    category: 'HOCKEY',
    description: 'Prestižní extraligové utkání mezi domácí Spartou a aktuálním mistrem Třincem. Napínavé derby plné rychlého hokeje a skvělé atmosféry v hledišti O2 Arény.',
    imageUrl: null,
    imageColor: '#c2410c',
    date: sd(9, 19, 0),
    doorsOpen: sd(9, 17, 30),
    additionalDates: [],
    venue: { name: 'O2 Arena Praha', address: 'Českomoravská 17', city: 'Praha 9' },
    organizer: 'HC Sparta Praha',
    prices: [
      { label: 'VIP Skybox (10 osob)', amount: 24000 },
      { label: 'Klubové sedadlo', amount: 1500 },
    ],
    downloads: [],
    homeAway: 'home',
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-o2-008',
    brandKey: 'o2arena',
    name: 'HC Sparta Praha vs. HC Mountfield HK',
    subtitle: 'Tipsport extraliga — 32. kolo',
    category: 'HOCKEY',
    description: 'Extraligové domácí utkání Sparty Praha proti Hradci Králové. Tipsport extraliga přináší do O2 Arény rychlý a technický hokej obou týmů.',
    imageUrl: null,
    imageColor: '#1d4ed8',
    date: sd(14, 19, 0),
    doorsOpen: sd(14, 17, 30),
    additionalDates: [],
    venue: { name: 'O2 Arena Praha', address: 'Českomoravská 17', city: 'Praha 9' },
    organizer: 'HC Sparta Praha',
    prices: [
      { label: 'VIP Skybox (10 osob)', amount: 28000 },
      { label: 'Klubové sedadlo', amount: 1800 },
    ],
    downloads: [],
    homeAway: 'home',
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-001',
    brandKey: 'o2arena',
    name: 'Hokejové MS 2026 — Česko vs. Kanada',
    subtitle: 'IIHF World Championship 2026',
    category: 'HOCKEY',
    description: 'Skupinový zápas Mistrovství světa v ledním hokeji IIHF 2026. Česká reprezentace změří síly s Kanadou v klíčovém utkání skupinové fáze. Nenechte si ujít tuto nezapomenutelnou hokejovou událost v srdci Prahy.',
    imageUrl: null,
    imageColor: '#0f4c8c',
    date: sd(18, 18, 0),
    doorsOpen: sd(18, 16, 30),
    additionalDates: [],
    venue: { name: 'O2 Arena Praha', address: 'Českomoravská 17', city: 'Praha 9' },
    organizer: 'IIHF / Hokej ČR',
    prices: [
      { label: 'VIP Skybox (10 osob)', amount: 32000 },
      { label: 'Klubové sedadlo', amount: 2800 },
    ],
    downloads: [{ label: 'Program utkání', url: '#' }],
    homeAway: null,
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-002',
    brandKey: 'o2arena',
    name: 'Coldplay — Music of the Spheres World Tour',
    subtitle: 'Chris Martin & kapela',
    category: 'CONCERT',
    description: 'Coldplay se vrací do Prahy s jejich fenomenálním Music of the Spheres World Tour. Vizuálně ohromující show plná hitů jako Yellow, The Scientist, Viva la Vida a celé řady nových skladeb. Jedno z nejkrásnějších živých vystoupení současnosti.',
    imageUrl: null,
    imageColor: '#7c3aed',
    date: sd(31, 20, 0),
    doorsOpen: sd(31, 18, 0),
    additionalDates: [],
    venue: { name: 'O2 Arena Praha', address: 'Českomoravská 17', city: 'Praha 9' },
    organizer: 'Live Nation Czech Republic',
    prices: [
      { label: 'VIP Skybox (10 osob)', amount: 34000 },
      { label: 'Klubové sedadlo', amount: 2200 },
    ],
    downloads: [],
    homeAway: null,
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-003',
    brandKey: 'o2arena',
    name: 'NBA Global Games — Chicago Bulls vs. Milwaukee Bucks',
    subtitle: 'NBA přichází do Prahy',
    category: 'BASKETBALL',
    description: 'NBA přichází do Prahy! Chicago Bulls změří síly s Milwaukee Bucks v exkluzivním zápase NBA Global Games. Zažijte basketbalovou přehlídku nejlepší ligy světa živě v O2 Areně.',
    imageUrl: null,
    imageColor: '#b91c1c',
    date: sd(45, 19, 30),
    doorsOpen: sd(45, 17, 30),
    additionalDates: [],
    venue: { name: 'O2 Arena Praha', address: 'Českomoravská 17', city: 'Praha 9' },
    organizer: 'NBA / Czech Basketball Federation',
    prices: [
      { label: 'VIP Skybox (10 osob)', amount: 30000 },
      { label: 'Klubové sedadlo', amount: 2800 },
    ],
    downloads: [],
    homeAway: null,
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-004',
    brandKey: 'o2arena',
    name: 'Metallica — M72 World Tour',
    subtitle: 'Special guests: Pantera',
    category: 'CONCERT',
    description: 'Metallica přiváží do Prahy svůj revoluční M72 World Tour. Dvě setlisty, žádná předkapela, maximální metal. Přípravte se na více než dvouhodinový devastující výkon jedné z nejlepších živých kapel světa.',
    imageUrl: null,
    imageColor: '#1c1c1c',
    date: sd(62, 19, 30),
    doorsOpen: sd(62, 17, 30),
    additionalDates: [],
    venue: { name: 'O2 Arena Praha', address: 'Českomoravská 17', city: 'Praha 9' },
    organizer: 'Live Nation Czech Republic',
    prices: [
      { label: 'VIP Skybox (10 osob)', amount: 38000 },
      { label: 'Klubové sedadlo', amount: 3200 },
    ],
    downloads: [],
    homeAway: null,
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-006',
    brandKey: 'o2arena',
    name: 'Billie Eilish — Hit Me Hard and Soft Tour',
    subtitle: 'World Tour 2026',
    category: 'CONCERT',
    description: 'Billie Eilish přichází s světovým turné k jejímu nejnovějšímu albu Hit Me Hard and Soft. Intimní show v kontrastu s masivní produkcí. Nezaměnitelný hlas, neuvěřitelná atmosféra.',
    imageUrl: null,
    imageColor: '#064e3b',
    date: sd(78, 20, 0),
    doorsOpen: sd(78, 18, 0),
    additionalDates: [],
    venue: { name: 'O2 Arena Praha', address: 'Českomoravská 17', city: 'Praha 9' },
    organizer: 'Live Nation Czech Republic',
    prices: [
      { label: 'VIP Skybox (10 osob)', amount: 36000 },
      { label: 'Klubové sedadlo', amount: 2800 },
    ],
    downloads: [],
    homeAway: null,
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },

  // ── T-ARENA BRNO ──────────────────────────────────────────────────────────────
  {
    id: 'ev-ta-001',
    brandKey: 'tarena',
    name: 'HC Kometa Brno vs. HC Sparta Praha',
    subtitle: 'Tipsport extraliga — 29. kolo',
    category: 'HOCKEY',
    description: 'Tipsport extraliga v brněnské T-Areně. Domácí Kometa Brno přivítá pražskou Spartu v prestižním utkání. Brněnské fanoušky čeká nezapomenutelný hokejový večer.',
    imageUrl: null,
    imageColor: '#b91c1c',
    date: sd(7, 18, 0),
    doorsOpen: sd(7, 16, 30),
    additionalDates: [],
    venue: { name: 'T-Arena Brno', address: 'Hala č. 1, Výstaviště', city: 'Brno' },
    organizer: 'HC Kometa Brno',
    prices: [
      { label: 'VIP Skybox (8 osob)', amount: 22000 },
      { label: 'Klubové sedadlo', amount: 1800 },
    ],
    downloads: [],
    homeAway: 'home',
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-ta-002',
    brandKey: 'tarena',
    name: 'HC Kometa Brno vs. HC Oceláři Třinec',
    subtitle: 'Tipsport extraliga — 33. kolo',
    category: 'HOCKEY',
    description: 'Lídr tabulky Třinec přijíždí do Brna. Kometa chce potvrdit domácí sílu v klíčovém extraligovém souboji sezóny.',
    imageUrl: null,
    imageColor: '#b91c1c',
    date: sd(21, 18, 0),
    doorsOpen: sd(21, 16, 30),
    additionalDates: [],
    venue: { name: 'T-Arena Brno', address: 'Hala č. 1, Výstaviště', city: 'Brno' },
    organizer: 'HC Kometa Brno',
    prices: [
      { label: 'VIP Skybox (8 osob)', amount: 20000 },
      { label: 'Klubové sedadlo', amount: 1600 },
    ],
    downloads: [],
    homeAway: 'home',
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-ta-004',
    brandKey: 'tarena',
    name: 'Les Misérables — Muzikál',
    subtitle: 'Muzikálové léto v Brně 2026',
    category: 'CONCERT',
    description: 'Legendární muzikál Les Misérables (Bídníci) přichází do Brna. Velkolepá produkce s živým orchestrem, ohromujícími kostýmy a nezapomenutelnými písněmi jako I Dreamed a Dream nebo One Day More.',
    imageUrl: null,
    imageColor: '#7c3aed',
    date: sd(28, 19, 30),
    doorsOpen: sd(28, 18, 0),
    additionalDates: [
      { date: sd(29, 15, 0), doorsOpen: sd(29, 13, 30) },
    ],
    venue: { name: 'T-Arena Brno', address: 'Hala č. 1, Výstaviště', city: 'Brno' },
    organizer: 'Stage Entertainment CZ',
    prices: [
      { label: 'VIP lóže', amount: 18000 },
      { label: 'Přední sedadla', amount: 2400 },
      { label: 'Standardní sedadlo', amount: 1200 },
    ],
    downloads: [{ label: 'Program muzikálu', url: '#' }],
    homeAway: null,
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-ta-003',
    brandKey: 'tarena',
    name: 'HC Kometa Brno vs. HC Dynamo Pardubice',
    subtitle: 'Tipsport extraliga — 36. kolo',
    category: 'HOCKEY',
    description: 'Extraligové utkání Komety Brno proti Dynamu Pardubice. Střet dvou ofenzivně laděných týmů slibuje góly a skvělou podívanou.',
    imageUrl: null,
    imageColor: '#b91c1c',
    date: sd(35, 18, 0),
    doorsOpen: sd(35, 16, 30),
    additionalDates: [],
    venue: { name: 'T-Arena Brno', address: 'Hala č. 1, Výstaviště', city: 'Brno' },
    organizer: 'HC Kometa Brno',
    prices: [
      { label: 'VIP Skybox (8 osob)', amount: 19000 },
      { label: 'Klubové sedadlo', amount: 1500 },
    ],
    downloads: [],
    homeAway: 'home',
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-ta-005',
    brandKey: 'tarena',
    name: 'Mamma Mia! — Muzikál',
    subtitle: 'Hudba skupiny ABBA',
    category: 'CONCERT',
    description: 'Nejveselejší muzikál světa s hudbou skupiny ABBA se vrací do Brna. Ohromující show, taneční čísla a nezapomenutelné hity jako Dancing Queen, Super Trouper nebo The Winner Takes It All.',
    imageUrl: null,
    imageColor: '#f59e0b',
    date: sd(50, 19, 30),
    doorsOpen: sd(50, 18, 0),
    additionalDates: [
      { date: sd(51, 15, 0), doorsOpen: sd(51, 13, 30) },
      { date: sd(52, 19, 30), doorsOpen: sd(52, 18, 0) },
    ],
    venue: { name: 'T-Arena Brno', address: 'Hala č. 1, Výstaviště', city: 'Brno' },
    organizer: 'Stage Entertainment CZ',
    prices: [
      { label: 'VIP lóže', amount: 16000 },
      { label: 'Přední sedadla', amount: 2000 },
      { label: 'Standardní sedadlo', amount: 980 },
    ],
    downloads: [{ label: 'Program muzikálu', url: '#' }],
    homeAway: null,
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },

  // ── SLAVIA / EDEN ─────────────────────────────────────────────────────────────
  {
    id: 'ev-sl-001',
    brandKey: 'slavia',
    name: 'SK Slavia Praha vs. FC Viktoria Plzeň',
    subtitle: 'Fortuna:Liga — 24. kolo',
    category: 'FOOTBALL',
    description: 'Ligový šlágr na Fortuna Areně. Slavia Praha přivítá věčného rivala Plzeň v souboji o čelo tabulky Fortuna:Ligy. Napínavý zápas dvou nejlepších týmů české ligy.',
    imageUrl: null,
    imageColor: '#cc0000',
    date: sd(6, 18, 0),
    doorsOpen: sd(6, 16, 30),
    additionalDates: [],
    venue: { name: 'Fortuna Arena', address: 'U Slavie 1540/2a', city: 'Praha 10' },
    organizer: 'SK Slavia Praha',
    prices: [
      { label: 'VIP Skybox (12 osob)', amount: 28000 },
      { label: 'Business Club sedadlo', amount: 2200 },
    ],
    downloads: [],
    homeAway: 'home',
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-sl-005',
    brandKey: 'slavia',
    name: 'Feyenoord Rotterdam vs. SK Slavia Praha',
    subtitle: 'UEFA Europa League — skupinová fáze',
    category: 'FOOTBALL',
    description: 'Slavia Praha cestuje do Rotterdamu na prestižní utkání Evropské ligy UEFA. Červenobílí změří síly s nidozemským gigantem Feyenoordem na legendárním stadionu De Kuip.',
    imageUrl: null,
    imageColor: '#cc3300',
    date: sd(13, 21, 0),
    doorsOpen: sd(13, 19, 0),
    additionalDates: [],
    venue: { name: 'Stadion De Kuip', address: 'Van Zandvlietplein 1', city: 'Rotterdam' },
    organizer: 'UEFA / Feyenoord Rotterdam',
    prices: [
      { label: 'VIP lóže', amount: 24000 },
      { label: 'Business sedadlo', amount: 1800 },
    ],
    downloads: [{ label: 'Cestovní informace', url: '#' }],
    homeAway: 'away',
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-sl-002',
    brandKey: 'slavia',
    name: 'SK Slavia Praha vs. AC Sparta Praha',
    subtitle: 'Pražské derby — Fortuna:Liga 27. kolo',
    category: 'FOOTBALL',
    description: 'Nejočekávanější zápas sezóny! Pražské derby — Slavia vs. Sparta. Vždy intenzivní, vždy plné emocí, vždy nezapomenutelné. Přijďte podpořit červenobílé v největší ligové bitvě roku.',
    imageUrl: null,
    imageColor: '#cc0000',
    date: sd(20, 18, 0),
    doorsOpen: sd(20, 16, 30),
    additionalDates: [],
    venue: { name: 'Fortuna Arena', address: 'U Slavie 1540/2a', city: 'Praha 10' },
    organizer: 'SK Slavia Praha',
    prices: [
      { label: 'VIP Skybox (12 osob)', amount: 36000 },
      { label: 'Business Club sedadlo', amount: 3000 },
    ],
    downloads: [],
    homeAway: 'home',
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-sl-003',
    brandKey: 'slavia',
    name: 'FK Baník Ostrava vs. SK Slavia Praha',
    subtitle: 'Fortuna:Liga — 29. kolo',
    category: 'FOOTBALL',
    description: 'Ligové utkání na půdě Baníku Ostrava. Slavia cestuje na Bazaly v boji o ligový titul. Výjezdní utkání plné vášně obou táborů fanoušků.',
    imageUrl: null,
    imageColor: '#0f4c8c',
    date: sd(27, 16, 0),
    doorsOpen: sd(27, 14, 30),
    additionalDates: [],
    venue: { name: 'Městský stadion Baník Ostrava', address: 'Bazaly 4552', city: 'Ostrava-Zábřeh' },
    organizer: 'FK Baník Ostrava',
    prices: [
      { label: 'VIP lóže', amount: 18000 },
      { label: 'Business sedadlo', amount: 1400 },
    ],
    downloads: [],
    homeAway: 'away',
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-sl-004',
    brandKey: 'slavia',
    name: 'SK Slavia Praha vs. SK Sigma Olomouc',
    subtitle: 'Fortuna:Liga — 31. kolo',
    category: 'FOOTBALL',
    description: 'Domácí ligové utkání Slavie Praha proti Sigmě Olomouc. Červenobílé čeká povinná výhra v boji o mistrovský titul.',
    imageUrl: null,
    imageColor: '#cc0000',
    date: sd(40, 16, 0),
    doorsOpen: sd(40, 14, 30),
    additionalDates: [],
    venue: { name: 'Fortuna Arena', address: 'U Slavie 1540/2a', city: 'Praha 10' },
    organizer: 'SK Slavia Praha',
    prices: [
      { label: 'VIP Skybox (12 osob)', amount: 24000 },
      { label: 'Business Club sedadlo', amount: 1800 },
    ],
    downloads: [],
    homeAway: 'home',
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },

  // ── PLG (DEFAULT) ─────────────────────────────────────────────────────────────
  {
    id: 'ev-plg-004',
    brandKey: 'default',
    name: 'Davis Cup Finals — Česko vs. Španělsko',
    subtitle: 'Davis Cup Finals — skupinová fáze',
    category: 'OTHER',
    description: 'Tenisová bitva na nejvyšší úrovni! Česká reprezentace se utká se Španělskem v Davis Cupu Finals. Česká tenisová tradice se střetne s jedním z nejsilnějších týmů světa.',
    imageUrl: null,
    imageColor: '#16a34a',
    date: sd(25, 14, 0),
    doorsOpen: sd(25, 12, 30),
    additionalDates: [
      { date: sd(26, 14, 0), doorsOpen: sd(26, 12, 30) },
    ],
    venue: { name: 'PLG Arena', address: 'Českomoravská 17', city: 'Praha 9' },
    organizer: 'ITF / Tenisový svaz ČR',
    prices: [
      { label: 'VIP Box (8 osob)', amount: 22000 },
      { label: 'Premium sedadlo', amount: 2400 },
    ],
    downloads: [],
    homeAway: null,
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-plg-005',
    brandKey: 'default',
    name: 'WTA Prague Open — Finále',
    subtitle: 'WTA 250 Series',
    category: 'OTHER',
    description: 'Finále prestižního tenisového turnaje WTA Prague Open. Nejlepší hráčky světa bojují o titul v srdci Prahy. Vzrušující tenis na nejvyšší úrovni.',
    imageUrl: null,
    imageColor: '#16a34a',
    date: sd(33, 14, 0),
    doorsOpen: sd(33, 12, 30),
    additionalDates: [],
    venue: { name: 'PLG Arena', address: 'Českomoravská 17', city: 'Praha 9' },
    organizer: 'WTA / Czech Tennis Association',
    prices: [
      { label: 'VIP Box (8 osob)', amount: 18000 },
      { label: 'Premium sedadlo', amount: 1800 },
    ],
    downloads: [],
    homeAway: null,
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-plg-003',
    brandKey: 'default',
    name: 'WWE SmackDown Live',
    subtitle: 'World Wrestling Entertainment',
    category: 'OTHER',
    description: 'WWE SmackDown Live přichází do Prahy! Světová wrestling show s vašimi oblíbenými superhvězdami a nezapomenutelnou podívanou pro celou rodinu. Připravte se na dramatické zápasy a šokující výsledky.',
    imageUrl: null,
    imageColor: '#1d4ed8',
    date: sd(38, 19, 0),
    doorsOpen: sd(38, 17, 0),
    additionalDates: [],
    venue: { name: 'PLG Arena', address: 'Českomoravská 17', city: 'Praha 9' },
    organizer: 'WWE Europe',
    prices: [
      { label: 'VIP Ringside Box', amount: 30000 },
      { label: 'Premium sedadlo', amount: 2800 },
    ],
    downloads: [],
    homeAway: null,
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-plg-001',
    brandKey: 'default',
    name: 'Eros Ramazzotti — Una Storia Importante',
    subtitle: 'World Tour 2026',
    category: 'CONCERT',
    description: 'Legendární italský zpěvák Eros Ramazzotti přichází s turné Una Storia Importante. Oceněný umělec s více než 60 miliony prodaných alb přináší své největší hity jako Più Bella Cosa, Terra Promessa a Se Bastasse Una Canzone.',
    imageUrl: null,
    imageColor: '#d97706',
    date: sd(55, 20, 0),
    doorsOpen: sd(55, 18, 0),
    additionalDates: [],
    venue: { name: 'PLG Arena', address: 'Českomoravská 17', city: 'Praha 9' },
    organizer: 'Live Nation',
    prices: [
      { label: 'VIP Box (8 osob)', amount: 26000 },
      { label: 'Premium sedadlo', amount: 2400 },
    ],
    downloads: [],
    homeAway: null,
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
  {
    id: 'ev-plg-002',
    brandKey: 'default',
    name: 'Andrea Bocelli — World Tour',
    subtitle: 'Classica & Popular',
    category: 'CONCERT',
    description: 'Tenorista světového věhlasu Andrea Bocelli přichází se svým World Tour. Nezapomenutelný večer plný klasické hudby, operních árií a popových duetů. Jedno z nejkrásnějších živých vystoupení, které si lze přát.',
    imageUrl: null,
    imageColor: '#1e3a5f',
    date: sd(70, 20, 0),
    doorsOpen: sd(70, 18, 0),
    additionalDates: [],
    venue: { name: 'PLG Arena', address: 'Českomoravská 17', city: 'Praha 9' },
    organizer: 'Live Nation',
    prices: [
      { label: 'VIP Box (8 osob)', amount: 28000 },
      { label: 'Premium sedadlo', amount: 2800 },
    ],
    downloads: [],
    homeAway: null,
    published: true,
    createdAt: ts,
    updatedAt: ts,
  },
]

// ── Store API ──────────────────────────────────────────────────────────────────

export function initStore() {
  const seeded = localStorage.getItem(SEED_VERSION_KEY)
  if (seeded !== CURRENT_VERSION) {
    localStorage.setItem(EVENTS_KEY, JSON.stringify(SEED_EVENTS))
    localStorage.setItem(SEED_VERSION_KEY, CURRENT_VERSION)
  }
}

function loadAll() {
  try {
    const raw = localStorage.getItem(EVENTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveAll(events) {
  localStorage.setItem(EVENTS_KEY, JSON.stringify(events))
}

/** All events for a brand (admin — includes drafts) */
export function getEvents(brandKey) {
  return loadAll()
    .filter(e => e.brandKey === brandKey)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

/** Only published events for a brand (B2B SPA) */
export function getPublishedEvents(brandKey) {
  return loadAll()
    .filter(e => e.brandKey === brandKey && e.published)
    .sort((a, b) => new Date(a.date) - new Date(b.date))
}

export function getEvent(id) {
  return loadAll().find(e => e.id === id) || null
}

export function saveEvent(event) {
  const all = loadAll()
  const idx = all.findIndex(e => e.id === event.id)
  const updated = { ...event, updatedAt: new Date().toISOString() }
  if (idx >= 0) {
    all[idx] = updated
  } else {
    all.push({ ...updated, createdAt: new Date().toISOString() })
  }
  saveAll(all)
  return updated
}

export function deleteEvent(id) {
  saveAll(loadAll().filter(e => e.id !== id))
}

export function generateEventId() {
  return `ev-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}
