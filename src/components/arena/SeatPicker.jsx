/**
 * SeatPicker — interactive seat grid for a single club section.
 * 5 rows (A–E) × 12 seats per row.
 * Shows available, selected, and unavailable seats.
 */

import { X } from 'lucide-react'
import { CLUB_SECTIONS, SECTION_UNAVAILABLE } from '@/lib/mockData'
import clsx from 'clsx'

const ROWS = ['A', 'B', 'C', 'D', 'E']
const SEATS_PER_ROW = 12

export default function SeatPicker({ sectionId, selectedSeats = [], onToggleSeat, onClose }) {
  const section = CLUB_SECTIONS[sectionId]
  const unavailable = SECTION_UNAVAILABLE[sectionId] || new Set()

  const selectedCount = selectedSeats.length

  return (
    <div
      className="card rounded-xl overflow-hidden"
      style={{ minWidth: 280 }}
    >
      {/* Header */}
      <div
        className="flex items-center justify-between px-4 py-3 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <div>
          <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
            {section?.label || `Sekce ${sectionId}`}
          </h3>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {selectedCount > 0
              ? `${selectedCount} ${selectedCount === 1 ? 'sedadlo vybráno' : selectedCount < 5 ? 'sedadla vybrána' : 'sedadel vybráno'}`
              : 'Klikněte na sedadlo pro výběr'
            }
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
            style={{ color: 'var(--color-text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--color-surface-2)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Stage direction indicator */}
      <div className="px-4 pt-3 pb-1">
        <div
          className="text-center text-xs py-1 rounded-md mb-3"
          style={{
            backgroundColor: 'var(--color-surface-2)',
            color: 'var(--color-text-subtle)',
            border: '1px solid var(--color-border)',
          }}
        >
          ↑ Hrací plocha / stage
        </div>

        {/* Seat grid */}
        <div className="space-y-1.5">
          {ROWS.slice(0, section?.rows || 5).map(row => (
            <div key={row} className="flex items-center gap-1.5">
              {/* Row label */}
              <div
                className="w-5 text-center text-xs font-medium shrink-0"
                style={{ color: 'var(--color-text-muted)' }}
              >
                {row}
              </div>

              {/* Seats */}
              <div className="flex gap-1">
                {Array.from({ length: section?.seatsPerRow || SEATS_PER_ROW }, (_, i) => {
                  const seatKey = `${row}-${i + 1}`
                  const isUnavailable = unavailable.has(seatKey)
                  const isSelected = selectedSeats.includes(seatKey)

                  return (
                    <button
                      key={seatKey}
                      disabled={isUnavailable}
                      onClick={() => !isUnavailable && onToggleSeat(seatKey)}
                      title={isUnavailable ? 'Nedostupné' : `Řada ${row}, sedadlo ${i + 1}`}
                      className={clsx(
                        'w-6 h-6 rounded text-xs flex items-center justify-center transition-all duration-100 font-medium',
                        isUnavailable ? 'seat-unavailable' :
                        isSelected ? 'seat-selected' :
                        'seat-available'
                      )}
                    >
                      {isSelected ? '✓' : isUnavailable ? '×' : i + 1}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Seat number axis */}
        <div className="flex gap-1 mt-1 ml-6">
          {Array.from({ length: section?.seatsPerRow || SEATS_PER_ROW }, (_, i) => (
            <div
              key={i}
              className="w-6 text-center text-xs"
              style={{ color: 'var(--color-text-subtle)' }}
            >
              {(i + 1) % 2 === 0 ? i + 1 : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        className="px-4 py-3 border-t flex gap-4 text-xs"
        style={{ borderColor: 'var(--color-border)', color: 'var(--color-text-muted)' }}
      >
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded seat-available" style={{ fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>1</div>
          <span>Dostupné</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded seat-selected" style={{ fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✓</div>
          <span>Vybráno</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-4 h-4 rounded seat-unavailable" style={{ fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</div>
          <span>Obsazeno</span>
        </div>
      </div>
    </div>
  )
}
