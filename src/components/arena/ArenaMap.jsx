/**
 * ArenaMap — clean SVG arena seating map.
 * Shows skybox sections and club sections.
 * Allocated sections are highlighted and clickable.
 *
 * Arena layout based on the O2 Arena Praha map:
 * - Sections 101–122: floor level (inner)
 * - Sections 201–226: club/skybox level (middle ring)
 * - Sections 301–366: upper level (outer)
 * - Skyboxes marked in specific 3xx positions
 * - Club sections: 222, 205, 209 (2xx range)
 */

import { useState } from 'react'
import { CheckSquare } from 'lucide-react'

// SVG viewport dimensions
const W = 800
const H = 640

// Arena oval parameters
const CX = W / 2
const CY = H / 2
const RX_OUTER = 340
const RY_OUTER = 270
const RX_INNER = 200
const RY_INNER = 155
const RX_ICE = 150
const RY_ICE = 100

// Generate section polygons arranged around the oval
// Returns array of { id, path, labelX, labelY, angle }
function generateSections(count, rxOuter, ryOuter, rxInner, ryInner, startAngle = -90) {
  const sections = []
  const step = (2 * Math.PI) / count
  for (let i = 0; i < count; i++) {
    const angle1 = (startAngle * Math.PI / 180) + i * step
    const angle2 = angle1 + step * 0.92 // small gap between sections

    const outerPts = [
      [CX + rxOuter * Math.cos(angle1), CY + ryOuter * Math.sin(angle1)],
      [CX + rxOuter * Math.cos(angle2), CY + ryOuter * Math.sin(angle2)],
    ]
    const innerPts = [
      [CX + rxInner * Math.cos(angle2), CY + ryInner * Math.sin(angle2)],
      [CX + rxInner * Math.cos(angle1), CY + ryInner * Math.sin(angle1)],
    ]

    const midAngle = (angle1 + angle2) / 2
    const labelR = (rxOuter + rxInner) / 2
    const labelRY = (ryOuter + ryInner) / 2

    sections.push({
      path: `M ${outerPts[0].join(' ')} L ${outerPts[1].join(' ')} L ${innerPts[0].join(' ')} L ${innerPts[1].join(' ')} Z`,
      labelX: CX + labelR * Math.cos(midAngle),
      labelY: CY + labelRY * Math.sin(midAngle),
      midAngle,
    })
  }
  return sections
}

// Upper ring sections (3xx) — 28 sections
const upperSections = generateSections(28, RX_OUTER, RY_OUTER, RX_OUTER - 55, RY_OUTER - 42, -90)
  .map((s, i) => ({ ...s, id: String(301 + i) }))

// Club/skybox ring sections (2xx) — 26 sections
const clubSections = generateSections(26, RX_OUTER - 58, RY_OUTER - 45, RX_OUTER - 100, RY_OUTER - 78, -90)
  .map((s, i) => ({ ...s, id: String(201 + i) }))

// Floor sections (1xx) — 22 sections
const floorSections = generateSections(22, RX_OUTER - 103, RY_OUTER - 82, RX_INNER + 30, RY_INNER + 24, -90)
  .map((s, i) => ({ ...s, id: String(101 + i) }))

// Map club section IDs (from mockData) to SVG section IDs
const CLUB_SECTION_MAP = {
  '222': '222', // upper ring, position ~21 → section 321 in upper ring
  '205': '205',
  '209': '209',
}

// Skybox positions — map skybox IDs to specific upper sections
const SKYBOX_SECTION_MAP = {
  'SB-05': '366',
  'SB-08': '308',
  'SB-09': '309',
}

// Find label positions for specific sections
function findSectionById(id) {
  // Check upper sections for 3xx
  const upperMatch = upperSections.find(s => s.id === id)
  if (upperMatch) return upperMatch
  // For 2xx sections, use club ring
  const clubMatch = clubSections.find(s => {
    // Map 201-226 to our club sections
    return s.id === id
  })
  return clubMatch || null
}

// Create a more realistic arena shape
// This function generates the actual section shapes positioned correctly
function buildArenaLayout(allocatedSkyboxIds, allocatedClubSectionIds, selectedSkyboxes, selectedClubSections, onSkyboxClick, onClubSectionClick) {
  const elements = []

  // Upper ring — 3xx sections
  // We'll show ~28 sections arranged around the oval
  const totalUpperSections = 28
  const step = (2 * Math.PI) / totalUpperSections
  for (let i = 0; i < totalUpperSections; i++) {
    const a1 = (-Math.PI / 2) + i * step
    const a2 = a1 + step * 0.9

    const o1x = CX + RX_OUTER * Math.cos(a1)
    const o1y = CY + RY_OUTER * Math.sin(a1)
    const o2x = CX + RX_OUTER * Math.cos(a2)
    const o2y = CY + RY_OUTER * Math.sin(a2)
    const i1x = CX + (RX_OUTER - 52) * Math.cos(a2)
    const i1y = CY + (RY_OUTER - 40) * Math.sin(a2)
    const i2x = CX + (RX_OUTER - 52) * Math.cos(a1)
    const i2y = CY + (RY_OUTER - 40) * Math.sin(a1)

    const mid = (a1 + a2) / 2
    const lx = CX + (RX_OUTER - 26) * Math.cos(mid)
    const ly = CY + (RY_OUTER - 20) * Math.sin(mid)

    // Section number: 301 + i (wrapping to make it look like real arena)
    let sectionNum = 301 + i
    if (sectionNum > 328) sectionNum += 4 // skip to ~333
    if (sectionNum > 340) sectionNum = 340 + (sectionNum - 340) // continue

    const sectionId = String(300 + i + 1)
    const isSkyboxSection = allocatedSkyboxIds.some(sid => SKYBOX_SECTION_MAP[sid] === sectionId)
    const isSelected = isSkyboxSection && selectedSkyboxes.some(sid => SKYBOX_SECTION_MAP[sid] === sectionId)
    const skyboxId = allocatedSkyboxIds.find(sid => SKYBOX_SECTION_MAP[sid] === sectionId)

    const path = `M${o1x},${o1y} L${o2x},${o2y} L${i1x},${i1y} L${i2x},${i2y} Z`

    elements.push(
      <g key={`upper-${i}`}>
        <path
          d={path}
          className={
            isSelected ? 'arena-section-selected' :
            isSkyboxSection ? 'arena-section-allocated' :
            'arena-section-neutral'
          }
          onClick={isSkyboxSection ? () => onSkyboxClick(skyboxId) : undefined}
        />
        <text
          x={lx} y={ly}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={isSkyboxSection ? 9 : 8}
          fontWeight={isSkyboxSection ? '600' : '400'}
          fill={isSkyboxSection ? 'var(--color-primary)' : 'var(--color-text-subtle)'}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {isSkyboxSection ? skyboxId : ''}
        </text>
      </g>
    )
  }

  // Club ring — 2xx sections
  const totalClubSections = 26
  const cStep = (2 * Math.PI) / totalClubSections
  for (let i = 0; i < totalClubSections; i++) {
    const a1 = (-Math.PI / 2) + i * cStep
    const a2 = a1 + cStep * 0.88

    const o1x = CX + (RX_OUTER - 54) * Math.cos(a1)
    const o1y = CY + (RY_OUTER - 42) * Math.sin(a1)
    const o2x = CX + (RX_OUTER - 54) * Math.cos(a2)
    const o2y = CY + (RY_OUTER - 42) * Math.sin(a2)
    const i1x = CX + (RX_OUTER - 95) * Math.cos(a2)
    const i1y = CY + (RY_OUTER - 73) * Math.sin(a2)
    const i2x = CX + (RX_OUTER - 95) * Math.cos(a1)
    const i2y = CY + (RY_OUTER - 73) * Math.sin(a1)

    const mid = (a1 + a2) / 2
    const lx = CX + (RX_OUTER - 74) * Math.cos(mid)
    const ly = CY + (RY_OUTER - 57) * Math.sin(mid)

    const sectionId = String(200 + i + 1)
    const isClubSection = allocatedClubSectionIds.includes(sectionId)
    const isSelected = isClubSection && selectedClubSections.includes(sectionId)

    const path = `M${o1x},${o1y} L${o2x},${o2y} L${i1x},${i1y} L${i2x},${i2y} Z`

    elements.push(
      <g key={`club-${i}`}>
        <path
          d={path}
          className={
            isSelected ? 'arena-section-selected' :
            isClubSection ? 'arena-section-allocated' :
            'arena-section-neutral'
          }
          onClick={isClubSection ? () => onClubSectionClick(sectionId) : undefined}
        />
        <text
          x={lx} y={ly}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={8}
          fontWeight={isClubSection ? '600' : '400'}
          fill={isClubSection ? 'var(--color-primary)' : 'var(--color-text-subtle)'}
          style={{ pointerEvents: 'none', userSelect: 'none' }}
        >
          {isClubSection ? sectionId : ''}
        </text>
      </g>
    )
  }

  // Floor sections (1xx) — simplified
  const totalFloor = 22
  const fStep = (2 * Math.PI) / totalFloor
  for (let i = 0; i < totalFloor; i++) {
    const a1 = (-Math.PI / 2) + i * fStep
    const a2 = a1 + fStep * 0.88

    const o1x = CX + (RX_OUTER - 97) * Math.cos(a1)
    const o1y = CY + (RY_OUTER - 75) * Math.sin(a1)
    const o2x = CX + (RX_OUTER - 97) * Math.cos(a2)
    const o2y = CY + (RY_OUTER - 75) * Math.sin(a2)
    const i1x = CX + (RX_INNER + 32) * Math.cos(a2)
    const i1y = CY + (RY_INNER + 26) * Math.sin(a2)
    const i2x = CX + (RX_INNER + 32) * Math.cos(a1)
    const i2y = CY + (RY_INNER + 26) * Math.sin(a1)

    const mid = (a1 + a2) / 2
    const lx = CX + (RX_OUTER - 128) * Math.cos(mid)
    const ly = CY + (RY_OUTER - 100) * Math.sin(mid)

    elements.push(
      <g key={`floor-${i}`}>
        <path
          d={`M${o1x},${o1y} L${o2x},${o2y} L${i1x},${i1y} L${i2x},${i2y} Z`}
          className="arena-section-neutral"
          style={{ fillOpacity: 0.5 }}
        />
        <text
          x={lx} y={ly}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={8}
          fill="var(--color-text-subtle)"
          style={{ pointerEvents: 'none', userSelect: 'none', opacity: 0.7 }}
        >
          {100 + i + 1}
        </text>
      </g>
    )
  }

  return elements
}

export default function ArenaMap({
  allocatedSkyboxIds = [],
  allocatedClubSectionIds = [],
  selectedSkyboxes = [],
  selectedClubSections = [],
  onSkyboxClick,
  onClubSectionClick,
}) {
  const sections = buildArenaLayout(
    allocatedSkyboxIds,
    allocatedClubSectionIds,
    selectedSkyboxes,
    selectedClubSections,
    onSkyboxClick || (() => {}),
    onClubSectionClick || (() => {}),
  )

  return (
    <div className="w-full" style={{ maxWidth: 600 }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        style={{ display: 'block' }}
      >
        {/* Background */}
        <rect width={W} height={H} fill="transparent" />

        {/* All sections */}
        {sections}

        {/* Ice/court surface */}
        <ellipse
          cx={CX} cy={CY}
          rx={RX_INNER - 10} ry={RY_INNER - 8}
          fill="var(--color-surface-2)"
          stroke="var(--color-border)"
          strokeWidth={1.5}
        />

        {/* Ice rink markings */}
        <ellipse cx={CX} cy={CY} rx={RX_INNER - 20} ry={RY_INNER - 18}
          fill="none" stroke="var(--color-border)" strokeWidth={1} strokeOpacity={0.5} />

        {/* Center line */}
        <line x1={CX} y1={CY - RY_INNER + 20} x2={CX} y2={CY + RY_INNER - 20}
          stroke="var(--color-border)" strokeWidth={1} strokeOpacity={0.4} />

        {/* Center circle */}
        <circle cx={CX} cy={CY} r={28}
          fill="none" stroke="var(--color-border)" strokeWidth={1} strokeOpacity={0.4} />

        {/* Face-off circles */}
        {[[-95, -50], [-95, 50], [95, -50], [95, 50]].map(([dx, dy], i) => (
          <circle key={i} cx={CX + dx} cy={CY + dy} r={22}
            fill="none" stroke="var(--color-border)" strokeWidth={1} strokeOpacity={0.3} />
        ))}

        {/* Center dot */}
        <circle cx={CX} cy={CY} r={4} fill="var(--color-border)" fillOpacity={0.5} />

        {/* Arena label */}
        <text
          x={CX} y={CY}
          textAnchor="middle" dominantBaseline="middle"
          fontSize={11} fontWeight="500"
          fill="var(--color-text-subtle)"
          style={{ userSelect: 'none' }}
        >
        </text>
      </svg>

      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 text-xs" style={{ color: 'var(--color-text-muted)' }}>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.25, border: '1px solid var(--color-primary)' }} />
          <span>Vaše alokace</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--color-primary)', opacity: 0.7 }} />
          <span>Vybráno</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }} />
          <span>Ostatní sekce</span>
        </div>
      </div>
    </div>
  )
}
