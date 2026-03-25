import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Check, CheckCircle2, Loader2, Minus, Plus } from 'lucide-react'
import { useApp } from '@/context/AppContext'
import { getEventDetail, getEventAllocations, createOrder, CATERING_ADDONS, SKYBOXES } from '@/lib/mockData'
import ArenaMap from '@/components/arena/ArenaMap'
import SeatPicker from '@/components/arena/SeatPicker'
import clsx from 'clsx'

// ─── Step indicator ────────────────────────────────────────────────────────────
function StepIndicator({ currentStep, steps }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((label, idx) => {
        const step = idx + 1
        const isDone = step < currentStep
        const isActive = step === currentStep

        return (
          <div key={step} className="flex items-center">
            <div className={clsx('flex flex-col items-center', isActive ? 'step-active' : isDone ? 'step-done' : 'step-pending')}>
              <div
                className="step-circle w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-200"
              >
                {isDone ? <Check size={14} /> : step}
              </div>
              <span
                className={clsx(
                  'text-xs mt-1 font-medium hidden sm:block',
                  isActive ? '' : isDone ? '' : ''
                )}
                style={{
                  color: isActive ? 'var(--color-primary)' : isDone ? 'var(--color-primary)' : 'var(--color-text-subtle)',
                }}
              >
                {label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div
                className="flex-1 h-0.5 mx-2 transition-all duration-300"
                style={{ backgroundColor: isDone ? 'var(--color-primary)' : 'var(--color-border)', minWidth: 32 }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Price summary sidebar ─────────────────────────────────────────────────────
function PriceSummary({ allocation, selectedSkyboxes, selectedSeatsBySection, selectedAddons, paymentMethod, t }) {
  const type1Allocs = allocation?.filter(a => a.kind === 'TYPE1') || []

  const lines = []
  let subtotal = 0

  // TYPE1 pricing
  type1Allocs.forEach(alloc => {
    selectedSkyboxes.forEach(skyboxId => {
      if (!alloc.skyboxes?.includes(skyboxId)) return
      const skybox = SKYBOXES[skyboxId]
      const fee = alloc.venueFeeCZKPerSkybox || 0
      const cateringTotal = (skybox?.capacity || 10) * (alloc.cateringFeeCZKPerSeat || 0)
      lines.push({ label: `Pronájem ${skyboxId}`, amount: fee, mandatory: true })
      lines.push({ label: `Catering ${skyboxId}`, amount: cateringTotal, mandatory: true })
      subtotal += fee + cateringTotal
    })

    alloc.clubSections?.forEach(secId => {
      const seatCount = (selectedSeatsBySection[secId] || []).length
      if (seatCount === 0) return
      const fee = (alloc.venueFeeCZKPerSeat || 0) * seatCount
      const cateringTotal = seatCount * (alloc.cateringFeeCZKPerSeat || 0)
      lines.push({ label: `Pronájem — sek. ${secId} (${seatCount}×)`, amount: fee, mandatory: true })
      lines.push({ label: `Catering — sek. ${secId} (${seatCount}×)`, amount: cateringTotal, mandatory: true })
      subtotal += fee + cateringTotal
    })
  })

  // Transaction fee
  const transactionFeePercent = type1Allocs[0]?.transactionFeePercent || 0
  const transactionFeeAmount = Math.round(subtotal * transactionFeePercent / 100)
  if (subtotal > 0 && transactionFeePercent > 0) {
    lines.push({ label: `Transakční poplatek (${transactionFeePercent}%)`, amount: transactionFeeAmount, mandatory: true })
    subtotal += transactionFeeAmount
  }

  // Optional add-ons
  let addonTotal = 0
  selectedAddons.forEach(({ addon, qty }) => {
    const amount = addon.pricePerUnit * qty
    lines.push({ label: `${addon.name} ×${qty}`, amount, mandatory: false })
    addonTotal += amount
  })

  // TYPE2/3 benefit value
  const benefitAllocs = allocation?.filter(a => a.kind === 'TYPE2' || a.kind === 'TYPE3') || []
  const benefitValue = benefitAllocs.reduce((sum, a) => sum + (a.benefitValueCZK || 0) * (a.availableCount || 0), 0)
  if (benefitValue > 0 && type1Allocs.length === 0) {
    lines.push({ label: 'Čerpáno z benefit kreditu', amount: -benefitValue, mandatory: true, isCredit: true })
  }

  const total = subtotal + addonTotal

  return (
    <div className="card rounded-xl p-4 sticky top-4">
      <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>
        Shrnutí ceny
      </h3>

      {lines.length === 0 ? (
        <p className="text-xs text-center py-4" style={{ color: 'var(--color-text-subtle)' }}>
          Vyberte místa pro zobrazení ceny
        </p>
      ) : (
        <>
          <div className="space-y-2 mb-4">
            {lines.map((line, i) => (
              <div key={i} className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  {line.mandatory && !line.isCredit && (
                    <span
                      className="text-xs px-1 py-0 rounded shrink-0"
                      style={{ backgroundColor: 'var(--color-surface-2)', color: 'var(--color-text-subtle)' }}
                    >
                      ●
                    </span>
                  )}
                  <span className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {line.label}
                  </span>
                </div>
                <span
                  className="text-xs font-medium shrink-0"
                  style={{ color: line.isCredit ? '#059669' : 'var(--color-text)' }}
                >
                  {line.isCredit ? '−' : ''}{Math.abs(line.amount).toLocaleString('cs-CZ')} Kč
                </span>
              </div>
            ))}
          </div>

          <div
            className="border-t pt-3 flex items-center justify-between"
            style={{ borderColor: 'var(--color-border)' }}
          >
            <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
              Celkem
            </span>
            <span className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
              {total.toLocaleString('cs-CZ')} Kč
            </span>
          </div>

          {type1Allocs.length > 0 && (
            <p className="text-xs mt-2" style={{ color: 'var(--color-text-subtle)' }}>
              ● Povinné položky nelze odebrat
            </p>
          )}
        </>
      )}
    </div>
  )
}

// ─── Step 1: Seat selection ────────────────────────────────────────────────────
function Step1({ allocations, currentPartner, selectedSkyboxes, setSelectedSkyboxes, selectedSeatsBySection, setSelectedSeatsBySection, t }) {
  const [activeSeatPickerSection, setActiveSeatPickerSection] = useState(null)

  const type1Allocs = allocations.filter(a => a.kind === 'TYPE1')
  // Fall back to partner's contracted allocation when no event-specific allocations exist
  const partnerHasType1 = currentPartner?.allocationKinds?.includes('TYPE1')
  const allSkyboxes = type1Allocs.length > 0
    ? type1Allocs.flatMap(a => a.skyboxes || [])
    : (partnerHasType1 ? currentPartner?.type1Allocation?.skyboxes || [] : [])
  const allClubSections = type1Allocs.length > 0
    ? type1Allocs.flatMap(a => a.clubSections || [])
    : (partnerHasType1 ? currentPartner?.type1Allocation?.clubSections || [] : [])

  const toggleSkybox = (skyboxId) => {
    setSelectedSkyboxes(prev =>
      prev.includes(skyboxId) ? prev.filter(s => s !== skyboxId) : [...prev, skyboxId]
    )
  }

  const toggleSeat = (sectionId, seatKey) => {
    setSelectedSeatsBySection(prev => {
      const current = prev[sectionId] || []
      const updated = current.includes(seatKey)
        ? current.filter(s => s !== seatKey)
        : [...current, seatKey]
      return { ...prev, [sectionId]: updated }
    })
  }

  const totalSelectedSeats = Object.values(selectedSeatsBySection).reduce((s, seats) => s + seats.length, 0)
  const totalSelected = selectedSkyboxes.length + totalSelectedSeats

  return (
    <div className="space-y-6">
      {/* Arena map */}
      <div className="card rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-4" style={{ color: 'var(--color-text)' }}>
          Všechna vaše smluvní místa jsou předvybrána — odznačte ta, která na tuto akci nepotřebujete
        </h3>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Map */}
          <div className="flex-1">
            <ArenaMap
              allocatedSkyboxIds={allSkyboxes}
              allocatedClubSectionIds={allClubSections}
              selectedSkyboxes={selectedSkyboxes}
              selectedClubSections={Object.keys(selectedSeatsBySection).filter(k => (selectedSeatsBySection[k] || []).length > 0)}
              onSkyboxClick={toggleSkybox}
              onClubSectionClick={sectionId => setActiveSeatPickerSection(
                activeSeatPickerSection === sectionId ? null : sectionId
              )}
            />
          </div>

          {/* Seat picker panel */}
          {activeSeatPickerSection && allClubSections.includes(activeSeatPickerSection) && (
            <div className="lg:w-96 shrink-0">
              <SeatPicker
                sectionId={activeSeatPickerSection}
                selectedSeats={selectedSeatsBySection[activeSeatPickerSection] || []}
                onToggleSeat={(seatKey) => toggleSeat(activeSeatPickerSection, seatKey)}
                onClose={() => setActiveSeatPickerSection(null)}
                contractedSeats={
                  currentPartner?.clubSeatMap?.[activeSeatPickerSection]?.length > 0
                    ? new Set(currentPartner.clubSeatMap[activeSeatPickerSection])
                    : undefined
                }
              />
            </div>
          )}
        </div>
      </div>

      {/* Skybox cards (if partner has skyboxes) */}
      {allSkyboxes.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
            {t('claim.skyboxes')}
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allSkyboxes.map(skyboxId => {
              const skybox = SKYBOXES[skyboxId]
              const isSelected = selectedSkyboxes.includes(skyboxId)
              return (
                <button
                  key={skyboxId}
                  onClick={() => toggleSkybox(skyboxId)}
                  className="text-left p-4 rounded-xl border-2 transition-all duration-150"
                  style={{
                    borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                    backgroundColor: isSelected ? 'var(--color-primary)' + '0f' : 'var(--color-surface)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                      {skybox?.label || skyboxId}
                    </span>
                    <div
                      className="w-5 h-5 rounded border-2 flex items-center justify-center transition-all"
                      style={{
                        borderColor: isSelected ? 'var(--color-primary)' : 'var(--color-border)',
                        backgroundColor: isSelected ? 'var(--color-primary)' : 'transparent',
                      }}
                    >
                      {isSelected && <Check size={12} style={{ color: 'var(--color-primary-fg)' }} />}
                    </div>
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {skybox?.capacity} míst · Patro {skybox?.floor}
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* Club sections list */}
      {allClubSections.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
            {t('claim.clubSeats')}
            <span className="font-normal text-xs ml-2" style={{ color: 'var(--color-text-muted)' }}>
              — klikněte na sekci pro úpravu výběru sedadel
            </span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {allClubSections.map(sectionId => {
              const seats = selectedSeatsBySection[sectionId] || []
              const isActive = activeSeatPickerSection === sectionId
              return (
                <button
                  key={sectionId}
                  onClick={() => setActiveSeatPickerSection(isActive ? null : sectionId)}
                  className="text-left p-4 rounded-xl border-2 transition-all duration-150"
                  style={{
                    borderColor: seats.length > 0 ? 'var(--color-primary)' : isActive ? 'var(--color-primary-light)' : 'var(--color-border)',
                    backgroundColor: seats.length > 0 ? 'var(--color-primary)' + '0f' : 'var(--color-surface)',
                  }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-semibold text-sm" style={{ color: 'var(--color-text)' }}>
                      Sekce {sectionId}
                    </span>
                    {seats.length > 0 && (
                      <span
                        className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-primary-fg)' }}
                      >
                        {seats.length} vybráno
                      </span>
                    )}
                  </div>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    Klikem otevřete výběr sedadel
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      )}

      {/* TYPE2/3 benefit info */}
      {allocations.filter(a => a.kind === 'TYPE2' || a.kind === 'TYPE3').map(alloc => (
        <div
          key={alloc.id}
          className="rounded-xl p-4 border"
          style={{ borderColor: 'var(--color-border)', backgroundColor: 'var(--color-surface-2)' }}
        >
          <div className="font-medium text-sm mb-1" style={{ color: 'var(--color-text)' }}>
            {alloc.kind === 'TYPE2' ? 'Benefit vstupenky — váš výběr' : 'Benefit vstupenky — automaticky přiřazeny'}
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {alloc.kind === 'TYPE2'
              ? `${alloc.availableCount} vstupenek k dispozici · Hodnota: ${alloc.benefitValueCZK?.toLocaleString('cs-CZ')} Kč/vs. · Čerpáno z benefit kreditu`
              : `${alloc.availableCount} vstupenek automaticky přiřazeno · Hodnota: ${alloc.benefitValueCZK?.toLocaleString('cs-CZ')} Kč/vs. · Čerpáno z benefit kreditu`
            }
          </p>
        </div>
      ))}

      {/* Selection count */}
      {totalSelected > 0 && (
        <div
          className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
          style={{ backgroundColor: 'var(--color-primary)' + '12', color: 'var(--color-primary-dark)' }}
        >
          <Check size={16} />
          Vybráno:
          {selectedSkyboxes.length > 0 && ` ${selectedSkyboxes.length} skybox`}
          {totalSelectedSeats > 0 && `, ${totalSelectedSeats} sedadel`}
        </div>
      )}
    </div>
  )
}

// ─── Step 2: Add-ons ───────────────────────────────────────────────────────────
function Step2({ allocations, selectedAddons, setSelectedAddons, locale, t }) {
  const type1Allocs = allocations.filter(a => a.kind === 'TYPE1')
  const firstAlloc = type1Allocs[0]

  const updateAddon = (addon, qty) => {
    setSelectedAddons(prev => {
      const without = prev.filter(a => a.addon.id !== addon.id)
      if (qty <= 0) return without
      return [...without, { addon, qty }]
    })
  }

  const getQty = (addonId) => selectedAddons.find(a => a.addon.id === addonId)?.qty || 0

  return (
    <div className="space-y-6">
      {/* Mandatory items (TYPE1) */}
      {type1Allocs.length > 0 && firstAlloc && (
        <div>
          <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
            {t('claim.mandatory')}
          </h3>
          <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
            {t('claim.mandatoryDesc')}
          </p>
          <div
            className="rounded-xl p-4 space-y-2"
            style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)' }}
          >
            {firstAlloc.venueFeeCZKPerSkybox && (
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>Pronájem prostor</span>
                <span style={{ color: 'var(--color-text)' }}>dle výběru</span>
              </div>
            )}
            {firstAlloc.venueFeeCZKPerSeat && (
              <div className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>Pronájem ({firstAlloc.venueFeeCZKPerSeat?.toLocaleString('cs-CZ')} Kč/sedadlo)</span>
                <span style={{ color: 'var(--color-text)' }}>dle výběru</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>Catering ({firstAlloc.cateringFeeCZKPerSeat?.toLocaleString('cs-CZ')} Kč/os.)</span>
              <span style={{ color: 'var(--color-text)' }}>dle výběru</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: 'var(--color-text-muted)' }}>Transakční poplatek ({firstAlloc.transactionFeePercent}%)</span>
              <span style={{ color: 'var(--color-text)' }}>ze součtu</span>
            </div>
          </div>
        </div>
      )}

      {/* Optional add-ons */}
      <div>
        <h3 className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>
          {t('claim.addons')}
        </h3>
        <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>
          {t('claim.addonsOptional')}
        </p>
        <div className="space-y-3">
          {CATERING_ADDONS.map(addon => {
            const qty = getQty(addon.id)
            const addonName = locale === 'cs' ? addon.name : addon.nameEn
            const addonUnit = locale === 'cs' ? addon.unit : addon.unitEn
            return (
              <div
                key={addon.id}
                className="card rounded-xl p-4 flex items-center gap-3"
              >
                <div className="text-2xl shrink-0">{addon.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>
                    {addonName}
                  </div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {addon.description}
                  </div>
                  <div className="text-xs font-medium mt-0.5" style={{ color: 'var(--color-primary)' }}>
                    {addon.pricePerUnit.toLocaleString('cs-CZ')} Kč/{addonUnit}
                  </div>
                </div>
                {/* Quantity stepper */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => updateAddon(addon, qty - 1)}
                    disabled={qty === 0}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all disabled:opacity-30"
                    style={{ backgroundColor: 'var(--color-surface-2)', border: '1px solid var(--color-border)', color: 'var(--color-text)' }}
                  >
                    <Minus size={14} />
                  </button>
                  <span
                    className="w-6 text-center text-sm font-semibold"
                    style={{ color: qty > 0 ? 'var(--color-primary)' : 'var(--color-text-subtle)' }}
                  >
                    {qty}
                  </span>
                  <button
                    onClick={() => updateAddon(addon, qty + 1)}
                    className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                    style={{ backgroundColor: qty === 0 ? 'var(--color-surface-2)' : 'var(--color-primary)', border: '1px solid var(--color-border)', color: qty === 0 ? 'var(--color-text)' : 'var(--color-primary-fg)' }}
                  >
                    <Plus size={14} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Step 3: Summary ───────────────────────────────────────────────────────────
function Step3({ event, allocations, selectedSkyboxes, selectedSeatsBySection, selectedAddons, paymentMethod, setPaymentMethod, t }) {
  const type1Allocs = allocations.filter(a => a.kind === 'TYPE1')
  const firstAlloc = type1Allocs[0]

  const totalSeats = Object.values(selectedSeatsBySection).reduce((s, seats) => s + seats.length, 0)

  let subtotal = 0
  const lines = []

  selectedSkyboxes.forEach(skyboxId => {
    const skybox = SKYBOXES[skyboxId]
    const alloc = type1Allocs.find(a => a.skyboxes?.includes(skyboxId))
    if (!alloc) return
    const venueFee = alloc.venueFeeCZKPerSkybox || 0
    const catering = (skybox?.capacity || 10) * (alloc.cateringFeeCZKPerSeat || 0)
    lines.push({ label: `Pronájem ${skyboxId}`, amount: venueFee })
    lines.push({ label: `Catering ${skyboxId}`, amount: catering })
    subtotal += venueFee + catering
  })

  type1Allocs.forEach(alloc => {
    alloc.clubSections?.forEach(secId => {
      const seats = (selectedSeatsBySection[secId] || []).length
      if (seats === 0) return
      const fee = (alloc.venueFeeCZKPerSeat || 0) * seats
      const catering = seats * (alloc.cateringFeeCZKPerSeat || 0)
      lines.push({ label: `Pronájem sek. ${secId} (${seats} sedadel × ${alloc.venueFeeCZKPerSeat?.toLocaleString('cs-CZ')} Kč)`, amount: fee })
      lines.push({ label: `Catering sek. ${secId} (${seats} osob × ${alloc.cateringFeeCZKPerSeat?.toLocaleString('cs-CZ')} Kč)`, amount: catering })
      subtotal += fee + catering
    })
  })

  const txFeePercent = firstAlloc?.transactionFeePercent || 0
  const txFee = Math.round(subtotal * txFeePercent / 100)
  if (txFee > 0) {
    lines.push({ label: `Transakční poplatek (${txFeePercent}%)`, amount: txFee })
    subtotal += txFee
  }

  let addonTotal = 0
  selectedAddons.forEach(({ addon, qty }) => {
    const amount = addon.pricePerUnit * qty
    lines.push({ label: `${addon.name} ×${qty}`, amount, isAddon: true })
    addonTotal += amount
  })

  const total = subtotal + addonTotal

  const hasBenefit = allocations.some(a => a.kind === 'TYPE2' || a.kind === 'TYPE3')

  return (
    <div className="space-y-5">
      {/* Selected seats summary */}
      <div className="card rounded-xl p-4">
        <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
          Vybraná místa
        </h3>
        {selectedSkyboxes.length === 0 && totalSeats === 0 && !hasBenefit ? (
          <p className="text-xs" style={{ color: 'var(--color-text-subtle)' }}>Nebyla vybrána žádná místa</p>
        ) : (
          <div className="space-y-1.5 text-sm">
            {selectedSkyboxes.map(id => (
              <div key={id} className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-primary)' }} />
                Skybox {id} ({SKYBOXES[id]?.capacity} míst)
              </div>
            ))}
            {Object.entries(selectedSeatsBySection).map(([sec, seats]) =>
              seats.length > 0 ? (
                <div key={sec} className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                  <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: 'var(--color-primary)' }} />
                  Sekce {sec}: {seats.join(', ')}
                </div>
              ) : null
            )}
            {hasBenefit && allocations.filter(a => a.kind === 'TYPE2' || a.kind === 'TYPE3').map(a => (
              <div key={a.id} className="flex items-center gap-2" style={{ color: 'var(--color-text)' }}>
                <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: '#059669' }} />
                {a.kind === 'TYPE2' ? 'Benefit' : 'Auto-benefit'}: {a.availableCount} vstupenek
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Price breakdown */}
      {(lines.length > 0 || hasBenefit) && (
        <div className="card rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
            Rozpis platby
          </h3>
          <div className="space-y-2">
            {lines.map((line, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>{line.label}</span>
                <span style={{ color: 'var(--color-text)' }}>{line.amount.toLocaleString('cs-CZ')} Kč</span>
              </div>
            ))}
            {hasBenefit && allocations.filter(a => a.kind !== 'TYPE1').map(a => (
              <div key={a.id} className="flex justify-between text-sm">
                <span style={{ color: 'var(--color-text-muted)' }}>
                  {a.kind === 'TYPE3' ? 'Auto-přiřazené benefit vstupenky' : 'Benefit vstupenky'}
                </span>
                <span style={{ color: '#059669' }}>z kreditu</span>
              </div>
            ))}
          </div>
          {total > 0 && (
            <div className="border-t mt-3 pt-3 flex justify-between items-center" style={{ borderColor: 'var(--color-border)' }}>
              <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>Celkem k úhradě</span>
              <span className="font-bold text-base" style={{ color: 'var(--color-primary)' }}>
                {total.toLocaleString('cs-CZ')} Kč
              </span>
            </div>
          )}
          {hasBenefit && total === 0 && (
            <div className="border-t mt-3 pt-3 flex justify-between items-center" style={{ borderColor: 'var(--color-border)' }}>
              <span className="font-bold text-sm" style={{ color: 'var(--color-text)' }}>K úhradě</span>
              <span className="font-bold text-base text-emerald-600">0 Kč (z kreditu)</span>
            </div>
          )}
        </div>
      )}

      {/* Payment method */}
      {total > 0 && (
        <div className="card rounded-xl p-4">
          <h3 className="font-semibold text-sm mb-3" style={{ color: 'var(--color-text)' }}>
            {t('claim.paymentMethod')}
          </h3>
          <div className="space-y-2">
            {[
              { value: 'INVOICE', label: t('claim.invoice'), desc: t('claim.invoiceDesc') },
              { value: 'CARD', label: t('claim.card'), desc: t('claim.cardDesc') },
            ].map(opt => (
              <label
                key={opt.value}
                className="flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all"
                style={{
                  borderColor: paymentMethod === opt.value ? 'var(--color-primary)' : 'var(--color-border)',
                  backgroundColor: paymentMethod === opt.value ? 'var(--color-primary)' + '0a' : 'transparent',
                }}
              >
                <input
                  type="radio"
                  name="payment"
                  value={opt.value}
                  checked={paymentMethod === opt.value}
                  onChange={() => setPaymentMethod(opt.value)}
                  className="mt-0.5 shrink-0 accent-primary"
                  style={{ accentColor: 'var(--color-primary)' }}
                />
                <div>
                  <div className="font-medium text-sm" style={{ color: 'var(--color-text)' }}>{opt.label}</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{opt.desc}</div>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Step 4: Confirmation ─────────────────────────────────────────────────────
function Step4({ orderId, event, t }) {
  const navigate = useNavigate()
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    if (countdown <= 0) { navigate('/dashboard'); return }
    const timer = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown, navigate])

  return (
    <div className="text-center py-8 animate-slide-up">
      {/* Checkmark */}
      <div className="flex justify-center mb-6">
        <div
          className="w-20 h-20 rounded-full flex items-center justify-center animate-pop-in"
          style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)' }}
        >
          <CheckCircle2 size={44} className="text-emerald-500" />
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--color-text)' }}>
        {t('claim.success')}
      </h2>
      <p className="mb-1" style={{ color: 'var(--color-text-muted)' }}>
        {t('claim.successDesc')}
      </p>
      <p className="text-sm font-medium mb-6" style={{ color: 'var(--color-text-muted)' }}>
        {t('claim.orderId')}: <span style={{ color: 'var(--color-text)' }}>{orderId}</span>
      </p>

      {event && (
        <div
          className="card rounded-xl p-4 max-w-xs mx-auto mb-8 text-left"
        >
          <div className="font-semibold text-sm mb-1" style={{ color: 'var(--color-text)' }}>{event.name}</div>
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            {new Date(event.date).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Link to="/account/tickets" className="btn-primary px-6 py-2.5 justify-center">
          {t('claim.goToTickets')}
        </Link>
        <Link to="/dashboard" className="btn-secondary px-6 py-2.5 justify-center">
          {t('claim.backToDashboard')}
        </Link>
      </div>

      <p className="text-xs mt-6" style={{ color: 'var(--color-text-subtle)' }}>
        {t('claim.redirecting')} {countdown}{t('claim.seconds')}…
      </p>
    </div>
  )
}

// ─── Main Wizard Page ─────────────────────────────────────────────────────────
export default function ClaimWizardPage() {
  const { eventId } = useParams()
  const { t, currentPartner, locale } = useApp()
  const navigate = useNavigate()

  const [step, setStep] = useState(1)
  const [event, setEvent] = useState(null)
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [orderId, setOrderId] = useState(null)

  // Selection state
  const [selectedSkyboxes, setSelectedSkyboxes] = useState([])
  const [selectedSeatsBySection, setSelectedSeatsBySection] = useState({})
  const [selectedAddons, setSelectedAddons] = useState([])
  const [paymentMethod, setPaymentMethod] = useState('INVOICE')

  const steps = [t('claim.step1'), t('claim.step2'), t('claim.step3'), t('claim.step4')]

  useEffect(() => {
    if (!currentPartner) return
    Promise.all([
      getEventDetail(eventId),
      getEventAllocations(currentPartner.id, eventId),
    ]).then(([ev, allocs]) => {
      setEvent(ev)
      setAllocations(allocs)
      // Pre-select all contracted seats (partner can deselect what they don't need)
      const type1 = allocs.filter(a => a.kind === 'TYPE1')
      setSelectedSkyboxes(type1.flatMap(a => a.skyboxes || []))
      const seatsBySection = {}
      type1.forEach(alloc => {
        ;(alloc.clubSections || []).forEach(secId => {
          const contracted = currentPartner?.clubSeatMap?.[secId]
          seatsBySection[secId] = contracted?.length > 0 ? [...contracted] : []
        })
      })
      setSelectedSeatsBySection(seatsBySection)
      setLoading(false)
    })
  }, [eventId, currentPartner])

  const canProceedStep1 = useMemo(() => {
    const type1 = allocations.filter(a => a.kind === 'TYPE1')
    if (type1.length === 0) return true // benefit only, no selection needed
    const totalSeats = Object.values(selectedSeatsBySection).reduce((s, v) => s + v.length, 0)
    return selectedSkyboxes.length > 0 || totalSeats > 0
  }, [allocations, selectedSkyboxes, selectedSeatsBySection])

  const handleNext = async () => {
    if (step < 3) { setStep(s => s + 1); return }
    if (step === 3) {
      setSubmitting(true)
      const result = await createOrder({
        partnerId: currentPartner.id,
        eventId,
        selectedSkyboxes,
        selectedSeatsBySection,
        selectedAddons,
        paymentMethod,
      })
      setOrderId(result.id)
      setSubmitting(false)
      setStep(4)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse space-y-4 max-w-2xl">
        <div className="h-8 rounded-lg w-64" style={{ backgroundColor: 'var(--color-surface-2)' }} />
        <div className="h-64 rounded-xl" style={{ backgroundColor: 'var(--color-surface-2)' }} />
      </div>
    )
  }

  return (
    <div className="animate-fade-in max-w-4xl">
      {/* Back */}
      {step < 4 && (
        <Link to={`/events/${eventId}`} className="btn-ghost mb-4 inline-flex">
          <ArrowLeft size={15} />
          {t('common.back')}
        </Link>
      )}

      {/* Event title */}
      {event && step < 4 && (
        <div className="mb-6">
          <h1 className="text-xl font-bold" style={{ color: 'var(--color-text)' }}>
            {event.name}
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {new Date(event.date).toLocaleDateString('cs-CZ', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
      )}

      {/* Step indicator */}
      {step < 4 && <StepIndicator currentStep={step} steps={steps} />}

      {/* Content + sidebar */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {step === 1 && (
            <Step1
              allocations={allocations}
              currentPartner={currentPartner}
              selectedSkyboxes={selectedSkyboxes}
              setSelectedSkyboxes={setSelectedSkyboxes}
              selectedSeatsBySection={selectedSeatsBySection}
              setSelectedSeatsBySection={setSelectedSeatsBySection}
              t={t}
            />
          )}
          {step === 2 && (
            <Step2
              allocations={allocations}
              selectedAddons={selectedAddons}
              setSelectedAddons={setSelectedAddons}
              locale={locale}
              t={t}
            />
          )}
          {step === 3 && (
            <Step3
              event={event}
              allocations={allocations}
              selectedSkyboxes={selectedSkyboxes}
              selectedSeatsBySection={selectedSeatsBySection}
              selectedAddons={selectedAddons}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              t={t}
            />
          )}
          {step === 4 && <Step4 orderId={orderId} event={event} t={t} />}
        </div>

        {/* Price summary sidebar (steps 1-3) */}
        {step < 4 && allocations.some(a => a.kind === 'TYPE1') && (
          <div className="lg:w-72 shrink-0">
            <PriceSummary
              allocation={allocations}
              selectedSkyboxes={selectedSkyboxes}
              selectedSeatsBySection={selectedSeatsBySection}
              selectedAddons={selectedAddons}
              paymentMethod={paymentMethod}
              t={t}
            />
          </div>
        )}
      </div>

      {/* Navigation buttons */}
      {step < 4 && (
        <div className="flex items-center justify-between mt-8 pt-6 border-t" style={{ borderColor: 'var(--color-border)' }}>
          <button
            onClick={() => step > 1 ? setStep(s => s - 1) : navigate(`/events/${eventId}`)}
            className="btn-secondary"
          >
            <ArrowLeft size={15} />
            {step === 1 ? t('common.cancel') : t('common.back')}
          </button>
          <button
            onClick={handleNext}
            disabled={(step === 1 && !canProceedStep1) || submitting}
            className="btn-primary"
          >
            {submitting ? (
              <><Loader2 size={15} className="animate-spin" />{t('claim.confirming')}</>
            ) : step === 3 ? (
              <><Check size={15} />{t('claim.confirmOrder')}</>
            ) : (
              <>{step === 1 ? t('claim.proceedToAddons') : t('claim.proceedToSummary')}<ArrowRight size={15} /></>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
