import { Canvas } from '@react-three/fiber'
import { useState } from 'react'
import CricketStadiumScene, { type CricketSeat } from './stadium/CricketStadiumScene'

interface Stadium3DProps {
  stadium: {
    name?: string
  }
  match: {
    teamA?: string
    teamB?: string
    localTime?: string
    matchTime?: string
  }
  seats: CricketSeat[]
  selectedSeats: string[]
  onSeatClick: (seatId: string) => void
  onViewFromSeat: () => void
}

function isNightMatch(localTime: string) {
  const time = localTime.match(/^(\d{1,2}):\d{2}\s*(AM|PM)?$/i)
  if (!time) return false

  const hour = Number(time[1])
  const normalizedHour = time[2]
    ? hour % 12 + (time[2].toUpperCase() === 'PM' ? 12 : 0)
    : hour

  return normalizedHour >= 18 || normalizedHour < 6
}

const Stadium3D = ({
  stadium,
  match,
  seats,
  selectedSeats,
  onSeatClick,
  onViewFromSeat,
}: Stadium3DProps) => {
  const [hoveredSeat, setHoveredSeat] = useState<CricketSeat | null>(null)
  const [focusedSeat, setFocusedSeat] = useState<CricketSeat | null>(null)
  const [cameraMode, setCameraMode] = useState<'overview' | 'seat'>('overview')
  const nightMode = isNightMatch(match.localTime ?? match.matchTime ?? '')

  const handleSeatClick = (seat: CricketSeat) => {
    setFocusedSeat(seat)
    setCameraMode('seat')
    onSeatClick(seat.id)
  }

  return (
    <div className="relative h-full min-h-[480px] w-full">
      <Canvas
        shadows
        dpr={[1, 1.5]}
        camera={{ position: [0, 200, 165], fov: 44, near: 0.1, far: 400 }}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <CricketStadiumScene
          stadiumName={stadium.name ?? 'Cricket Stadium'}
          teamA={match.teamA ?? 'Home'}
          teamB={match.teamB ?? 'Away'}
          seats={seats}
          selectedSeatIds={selectedSeats}
          hoveredSeatId={hoveredSeat?.id ?? null}
          focusedSeat={focusedSeat}
          cameraMode={cameraMode}
          nightMode={nightMode}
          onSeatClick={handleSeatClick}
          onSeatHover={setHoveredSeat}
        />
      </Canvas>

      {focusedSeat && (
        <button
          type="button"
          onClick={onViewFromSeat}
          className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-xl border border-white/15 bg-[#07111b]/90 px-4 py-2 text-sm font-semibold text-white shadow-xl backdrop-blur-md transition hover:bg-white/10"
        >
          View from seat
        </button>
      )}
    </div>
  )
}

export default Stadium3D
