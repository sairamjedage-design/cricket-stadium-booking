import * as THREE from 'three'
import { useThree } from '@react-three/fiber'
import { useStadiumStore } from '../../store/stadiumStore'

interface SeatProps {
  seat: any
  onSelect: (seat: any) => void
}

const Seat: React.FC<SeatProps> = ({ seat, onSelect }) => {
  const { scene } = useThree()
  const [hovered, setHovered] = React.useState(false)
  const [selected, setSelected] = React.useState(false)

  // Check if seat is selected from store
  React.useEffect(() => {
    const { selectedSeats } = useStadiumStore.getState()
    setSelected(selectedSeats.some((s: any) => s.id === seat.id))
  }, [seat.id])

  // Determine seat color based on status and interaction state
  const getSeatColor = () => {
    if (seat.status === 'BOOKED') {
      return selected ? '#ff6b6b' : '#ff4757' // Red for booked
    } else if (seat.status === 'BLOCKED') {
      return selected ? '#ffa502' : '#ff9f1c' // Orange for blocked
    } else if (selected) {
      return '#ff9f1c' // Orange for selected available seat
    } else if (hovered) {
      return '#2ed573' // Light green for hover
    } else {
      return seat.status === 'AVAILABLE' ? '#2ed573' : '#ff4757' // Green for available, red for booked
    }
  }

  const handleClick = (event: any) => {
    event.stopPropagation() // Prevent triggering on canvas
    onSelect(seat)
  }

  const handlePointerOver = () => {
    setHovered(true)
  }

  const handlePointerOut = () => {
    setHovered(false)
  }

  return (
    <mesh
      position={[seat.positionX, 0.1, seat.positionZ]} // Slightly above ground
      onClick={handleClick}
      onPointerOver={handlePointerOver}
      onPointerOut={handlePointerOut}
      cursor="pointer"
    >
      <boxGeometry args={[0.6, 0.2, 0.6]} />
      <meshStandardMaterial
        color={getSeatColor()}
        roughness={0.4}
        metalness={0.1}
      />
    </mesh>
  )
}

export default Seat