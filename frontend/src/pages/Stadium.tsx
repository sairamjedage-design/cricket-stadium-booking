import { Canvas } from '@react-three/fiber'
import { ArrowLeft, CarFront, Eye, Rotate3D, RotateCcw, Ticket } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import CricketStadiumScene, { type CricketSeat } from '../components/stadium/CricketStadiumScene'
import { demoMatches } from '../services/demoMatches'
import { useStadiumStore } from '../store/stadiumStore'

const tiers = [
  { id: 'lower', name: 'Lower Tier', rows: 8, radius: 50, height: 4, price: 900, category: 'General' },
  { id: 'middle', name: 'Middle Tier', rows: 7, radius: 63, height: 20, price: 1500, category: 'Premium' },
  { id: 'upper', name: 'Upper Tier', rows: 6, radius: 77, height: 36, price: 2200, category: 'Upper' },
]

const stands = [
  { id: 'north', name: 'North Stand', block: 'N' },
  { id: 'north-east', name: 'North-East Stand', block: 'NE' },
  { id: 'east', name: 'East Stand', block: 'E' },
  { id: 'south-east', name: 'South-East Stand', block: 'SE' },
  { id: 'south', name: 'South Stand', block: 'S' },
  { id: 'south-west', name: 'South-West Stand', block: 'SW' },
  { id: 'west', name: 'West Stand', block: 'W' },
  { id: 'north-west', name: 'North-West Stand', block: 'NW' },
]

function hashSeat(id: string) {
  let hash = 0
  for (let index = 0; index < id.length; index += 1) {
    hash = (hash * 31 + id.charCodeAt(index)) >>> 0
  }
  return hash % 100
}

function isNightMatch(localTime: string) {
  const time = localTime.match(/^(\d{1,2}):\d{2}\s*(AM|PM)$/i)
  if (!time) return false

  const hour = Number(time[1]) % 12 + (time[2].toUpperCase() === 'PM' ? 12 : 0)
  return hour >= 18 || hour < 6
}

function createSeats(minTicketPrice: number, maxTicketPrice: number): CricketSeat[] {
  const seats: CricketSeat[] = []
  const sectionWidth = (Math.PI * 2) / stands.length
  const seatCount = 32

  stands.forEach((stand, standIndex) => {
    tiers.forEach((tier, tierIndex) => {
      for (let rowIndex = 0; rowIndex < tier.rows; rowIndex += 1) {
        const rowNumber = rowIndex + 1
        for (let seatNumber = 1; seatNumber <= seatCount; seatNumber += 1) {
          const angle = standIndex * sectionWidth + (seatNumber / (seatCount + 1) - 0.5) * (sectionWidth - 0.055)
          const rowRadius = tier.radius + rowIndex * 1.15
          const positionX = Math.cos(angle) * rowRadius
          const positionZ = Math.sin(angle) * rowRadius * 0.76
          const positionY = tier.height + rowIndex * 0.82
          const id = `${stand.block}-${tier.id}-R${rowNumber}-S${seatNumber}`
          const hash = hashSeat(id)
          const status = hash < 10 ? 'BOOKED' : hash < 12 ? 'BLOCKED' : 'AVAILABLE'
          const category =
            tierIndex === 2 && ['E', 'W'].includes(stand.block)
              ? 'Corporate'
              : tier.category
          const basePrice = category === 'Corporate' ? 4200 : tier.price
          const price = Math.round(
            (minTicketPrice + ((basePrice - 900) / (4200 - 900)) * (maxTicketPrice - minTicketPrice)) / 50,
          ) * 50
          const distanceFromPitch = Math.max(8, Math.round(rowRadius - 10))
          const sideAngle = Math.abs(Math.cos(angle))
          const viewingQuality = Math.min(
            98,
            Math.max(61, Math.round(97 - sideAngle * 19 - Math.abs(rowRadius - 59) * 0.36 + positionY * 0.09)),
          )

          seats.push({
            id,
            sectionId: `${stand.id}-${tier.id}`,
            sectionName: `${stand.name} · ${tier.name}`,
            block: `${stand.block}${tierIndex + 1}`,
            tier: tier.name,
            rowNumber,
            seatNumber,
            seatLabel: `${String.fromCharCode(64 + rowNumber)}${seatNumber}`,
            status,
            category,
            price,
            positionX,
            positionY,
            positionZ,
            distanceFromPitch,
            viewingQuality,
          })
        }
      }
    })
  })

  return seats
}

export default function Stadium() {
  const { matchId } = useParams<{ matchId: string }>()
  const navigate = useNavigate()
  const match = demoMatches.find((fixture) => fixture.id === matchId) ?? demoMatches[0]
  const nightMode = isNightMatch(match.localTime)
  const allSeats = useMemo(
    () => createSeats(match.minTicketPrice, match.maxTicketPrice),
    [match.id, match.maxTicketPrice, match.minTicketPrice],
  )
  const selectedSeats = useStadiumStore((state) => state.selectedSeats)
  const setSelectedMatchId = useStadiumStore((state) => state.setSelectedMatchId)
  const setSections = useStadiumStore((state) => state.setSections)
  const setSeatAvailability = useStadiumStore((state) => state.setSeatAvailability)
  const addSelectedSeat = useStadiumStore((state) => state.addSelectedSeat)
  const removeSelectedSeat = useStadiumStore((state) => state.removeSelectedSeat)
  const clearSelectedSeats = useStadiumStore((state) => state.clearSelectedSeats)
  const cameraMode = useStadiumStore((state) => state.cameraMode)
  const setCameraMode = useStadiumStore((state) => state.setCameraMode)

  const [hoveredSeat, setHoveredSeat] = useState<CricketSeat | null>(null)
  const [focusedSeat, setFocusedSeat] = useState<CricketSeat | null>(null)

  const stadium = {
    name: match.stadiumName,
    location: `${match.city}, ${match.country}`,
    capacity: match.stadiumName === "Lord's Cricket Ground" ? 31100 : 132000,
  }

  const selectedSeatIds = useMemo(() => selectedSeats.map((seat) => seat.id), [selectedSeats])
  const seatMap = useMemo(() => new Map(allSeats.map((seat) => [seat.id, seat])), [allSeats])
  const selectedFullSeats = selectedSeatIds
    .map((id) => seatMap.get(id))
    .filter((seat): seat is CricketSeat => seat !== undefined)
  const total = selectedFullSeats.reduce((sum, seat) => sum + seat.price, 0)
  const detailSeat = hoveredSeat ?? focusedSeat

  useEffect(() => {
    setSelectedMatchId(matchId ?? demoMatches[0].id)
    setSections(
      stands.flatMap((stand) =>
        tiers.map((tier, tierIndex) => ({
          id: `${stand.id}-${tier.id}`,
          name: `${stand.name} · ${tier.name}`,
          tier: tier.name,
          category: tier.category,
          price: tier.price,
          rows: tier.rows,
          seatsPerRow: 32,
          block: `${stand.block}${tierIndex + 1}`,
        })),
      ),
    )
    setSeatAvailability(
      Object.fromEntries(
        allSeats.map((seat) => [
          seat.id,
          {
            ...seat,
            rowNumber: seat.rowNumber,
            seatNumber: seat.seatNumber,
            seatLabel: seat.seatLabel,
          },
        ]),
      ),
    )
    clearSelectedSeats()
    setFocusedSeat(null)
    setCameraMode('overview')
  }, [allSeats, clearSelectedSeats, matchId, setCameraMode, setSeatAvailability, setSections, setSelectedMatchId])

  const handleSeatClick = (seat: CricketSeat) => {
    setFocusedSeat(seat)
    setCameraMode('seat')

    if (seat.status !== 'AVAILABLE') return

    const selected = selectedSeats.some((item) => item.id === seat.id)
    if (selected) {
      removeSelectedSeat(seat.id)
    } else {
      addSelectedSeat(seat)
    }
  }

  const exitSeatView = () => {
    setCameraMode('overview')
    setFocusedSeat(null)
  }

  const openBooking = () => {
    if (selectedSeats.length === 0) return
    navigate('/booking')
  }

  return (
    <main className="min-h-screen bg-[#07111b] text-slate-100">
      <header className="flex min-h-[72px] items-center justify-between border-b border-white/10 bg-[#0a1520] px-5 md:px-9">
        <div className="flex items-center gap-4">
          <Link
            to="/matches"
            aria-label="Back to matches"
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10"
          >
            <ArrowLeft size={18} />
          </Link>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-300">CricketVerse</p>
            <h1 className="text-base font-semibold text-white">Choose your view</h1>
          </div>
        </div>
        <div className="hidden text-right md:block">
          <p className="text-sm font-semibold">{stadium.name}</p>
          <p className="text-xs text-slate-400">{stadium.location}</p>
        </div>
      </header>

      <section className="grid min-h-[calc(100vh-72px)] grid-cols-1 xl:grid-cols-[minmax(0,1fr)_390px]">
        <div className="relative min-h-[64vh] overflow-hidden border-b border-white/10 xl:min-h-[calc(100vh-72px)] xl:border-b-0 xl:border-r">
          <Canvas
            shadows
            dpr={[1, 1.5]}
            camera={{ position: [0, 200, 165], fov: 44, near: 0.1, far: 400 }}
            gl={{ antialias: true, powerPreference: 'high-performance' }}
          >
            <CricketStadiumScene
              stadiumName={match.stadiumName}
              teamA={match.teamA}
              teamB={match.teamB}
              seats={allSeats}
              selectedSeatIds={selectedSeatIds}
              hoveredSeatId={hoveredSeat?.id ?? null}
              focusedSeat={focusedSeat}
              cameraMode={cameraMode}
              nightMode={nightMode}
              onSeatClick={handleSeatClick}
              onSeatHover={setHoveredSeat}
            />
          </Canvas>

          <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-wrap items-start justify-between gap-3 p-4 md:p-6">
            <div className="pointer-events-auto rounded-2xl border border-white/10 bg-[#07111b]/80 px-4 py-3 shadow-2xl backdrop-blur-md">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-300">{match.tournament}</p>
              <p className="mt-1 text-lg font-bold">{match.teamA} <span className="text-emerald-300">vs</span> {match.teamB}</p>
              <p className="text-xs text-slate-300">
                {new Date(match.matchDate).toLocaleDateString('en-IN', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  timeZone: 'UTC',
                })} · {match.localTime} {match.timeZone} · {match.format}
              </p>
              {nightMode && (
                <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.15em] text-amber-200">
                  Night match · floodlights active
                </p>
              )}
            </div>

            <div className="pointer-events-auto flex flex-wrap items-center justify-end gap-2">
              {cameraMode === 'seat' ? (
                <button
                  type="button"
                  onClick={exitSeatView}
                  className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#07111b]/85 px-4 py-3 text-sm font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-white/10"
                >
                  <RotateCcw size={16} /> Stadium overview
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => setCameraMode(cameraMode === 'exterior' ? 'overview' : 'exterior')}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-[#07111b]/85 px-3 py-2.5 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-white/10"
                  >
                    <CarFront size={15} />
                    {cameraMode === 'exterior' ? 'Return to seating bowl' : 'Exterior & parking'}
                  </button>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-[#07111b]/80 px-3 py-2 text-xs text-slate-300 backdrop-blur-md">
                    <Rotate3D size={15} className="text-emerald-300" /> Drag to rotate · Scroll to zoom
                  </div>
                </>
              )}
            </div>
          </div>

          {cameraMode === 'exterior' && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-white/20 bg-[#07111b]/85 px-5 py-2 text-center text-xs text-white shadow-xl backdrop-blur-md">
              {nightMode ? 'Night match · floodlit exterior · entry plaza · car parks' : 'Daylight exterior · entry plaza · landscaped grounds · car parks'}
            </div>
          )}

          {cameraMode === 'seat' && focusedSeat && (
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 rounded-full border border-emerald-200/20 bg-[#07111b]/85 px-5 py-2 text-center text-xs text-emerald-100 shadow-xl backdrop-blur-md">
              First-person preview · {focusedSeat.sectionName} · Row {focusedSeat.rowNumber}
            </div>
          )}

          {hoveredSeat && cameraMode !== 'seat' && (
            <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 rounded-xl border border-white/10 bg-[#07111b]/90 px-4 py-3 text-center shadow-xl backdrop-blur-md">
              <p className="text-sm font-semibold">{hoveredSeat.sectionName}</p>
              <p className="text-xs text-slate-300">
                Block {hoveredSeat.block} · Row {hoveredSeat.rowNumber} · Seat {hoveredSeat.seatLabel} · ₹{hoveredSeat.price.toLocaleString('en-IN')}
              </p>
            </div>
          )}
        </div>

        <aside className="flex flex-col bg-[#0b1622]">
          <div className="border-b border-white/10 p-5 md:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-emerald-300">Interactive 3D seating</p>
                <h2 className="mt-1 text-xl font-bold">{stadium.name}</h2>
                <p className="mt-1 text-xs text-slate-400">{stadium.location} · Capacity {stadium.capacity.toLocaleString('en-IN')}</p>
              </div>
              <span className="rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-200">
                {match.status}
              </span>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-2 text-[11px]">
              {[
                ['#44d7a8', 'Available'],
                ['#ffd166', 'Selected'],
                ['#768397', 'Booked'],
                ['#e9a34b', 'Unavailable'],
              ].map(([color, label]) => (
                <div key={label} className="flex items-center gap-2 text-slate-300">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: color }} />
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1 space-y-5 overflow-y-auto p-5 md:p-6">
            <section className="rounded-2xl border border-white/10 bg-white/[0.035] p-4">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold">Seat details</h3>
                {detailSeat && <span className="text-xs font-semibold text-emerald-300">{detailSeat.category}</span>}
              </div>
              {detailSeat ? (
                <>
                  <div className="mb-4 rounded-xl border border-emerald-200/10 bg-[#07111b] p-3">
                    <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">{detailSeat.sectionName}</p>
                    <div className="mt-1 flex items-baseline justify-between gap-2">
                      <p className="text-base font-bold">Block {detailSeat.block} · Row {detailSeat.rowNumber} · Seat {detailSeat.seatLabel}</p>
                      <p className="whitespace-nowrap text-lg font-bold text-emerald-300">₹{detailSeat.price.toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Detail label="Availability" value={detailSeat.status} />
                    <Detail label="Tier" value={detailSeat.tier} />
                    <Detail label="Distance to pitch" value={`~${detailSeat.distanceFromPitch} m`} />
                    <Detail label="View estimate" value={`${detailSeat.viewingQuality}/100`} />
                  </div>
                  <p className="mt-3 text-[10px] leading-4 text-slate-500">
                    View quality and distance are approximate estimates for this visualization.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCameraMode('seat')}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-emerald-300/20 bg-emerald-300/10 px-3 py-2.5 text-sm font-semibold text-emerald-100 transition hover:bg-emerald-300/15"
                  >
                    <Eye size={16} /> View from this seat
                  </button>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-white/10 px-3 py-6 text-center">
                  <p className="text-sm text-slate-300">Select or hover over an individual seat in the stadium.</p>
                  <p className="mt-1 text-xs text-slate-500">Click any seat to open its pitch-level view.</p>
                </div>
              )}
            </section>

            <section>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-bold">Your tickets</h3>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-xs text-slate-300">{selectedFullSeats.length} seats</span>
              </div>
              {selectedFullSeats.length ? (
                <div className="space-y-2">
                  {selectedFullSeats.map((seat) => (
                    <div key={seat.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.035] p-3">
                      <div>
                        <p className="text-xs font-semibold">{seat.sectionName}</p>
                        <p className="mt-0.5 text-[11px] text-slate-400">Block {seat.block} · {seat.seatLabel}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-bold text-emerald-200">₹{seat.price.toLocaleString('en-IN')}</span>
                        <button
                          type="button"
                          aria-label={`Remove seat ${seat.seatLabel}`}
                          onClick={() => removeSelectedSeat(seat.id)}
                          className="rounded-md px-1.5 py-1 text-xs text-slate-400 hover:bg-white/10 hover:text-white"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="rounded-xl border border-dashed border-white/10 p-4 text-center text-xs text-slate-400">
                  Click an available seat to add it to your selection.
                </p>
              )}
            </section>
          </div>

          <div className="border-t border-white/10 bg-[#09131e] p-5 md:p-6">
            <div className="mb-4 flex items-end justify-between">
              <div>
                <p className="text-xs text-slate-400">Total for {selectedFullSeats.length} ticket{selectedFullSeats.length === 1 ? '' : 's'}</p>
                <p className="mt-1 text-2xl font-bold">₹{total.toLocaleString('en-IN')}</p>
              </div>
              <Ticket size={22} className="mb-1 text-emerald-300" />
            </div>
            <button
              type="button"
              onClick={openBooking}
              disabled={selectedFullSeats.length === 0}
              className="w-full rounded-xl bg-emerald-400 px-4 py-3 text-sm font-bold text-[#062018] transition hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Continue to booking
            </button>
            <p className="mt-3 text-center text-[10px] text-slate-500">Demo availability is illustrative and not held on a server.</p>
          </div>
        </aside>
      </section>
    </main>
  )
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-xs font-semibold text-slate-200">{value}</p>
    </div>
  )
}
