import { useThree } from '@react-three/fiber'
import { useStadiumStore } from '../../store/stadiumStore'

interface ViewFromSeatButtonProps {
  selectedSeats: any[]
  stadium: any
  setCameraTarget: (target: THREE.Vector3 | null) => void
  setCameraMode: (mode: 'overview' | 'section' | 'seat') => void
}

const ViewFromSeatButton: React.FC<ViewFromSeatButtonProps> = ({
  selectedSeats,
  stadium,
  setCameraTarget,
  setCameraMode
}) => {
  const { camera } = useThree()

  const handleViewFromSeat = () => {
    if (selectedSeats.length === 0) {
      alert('Please select a seat first')
      return
    }

    if (selectedSeats.length > 1) {
      alert('Please select only one seat to view from')
      return
    }

    const seat = selectedSeats[0]

    // Calculate camera position for view from seat
    // Position camera slightly behind and above the seat, looking at the pitch
    const seatPosition = new THREE.Vector3(seat.positionX, 1.5, seat.positionZ) // Eye level height

    // Look towards the center of the pitch (0, 0, 0)
    const lookAtPosition = new THREE.Vector3(0, 0, 0)

    // Position camera behind the seat
    const cameraPosition = seatPosition.clone()
      .sub(lookAtPosition.clone().normalize().multiplyScalar(5)) // 5 units back
      .add(new THREE.Vector3(0, 2, 0)) // 2 units up

    setCameraTarget(lookAtPosition)
    setCameraMode('seat')

    // In a real implementation, we'd animate the camera movement
    // For now, we'll just set it directly
    camera.position.copy(cameraPosition)
    camera.lookAt(lookAtPosition)
  }

  return (
    <div className="absolute bottom-20 left-1/2 transform -translate-x-1/2 flex items-center space-x-2 bg-white bg-opacity-90 rounded-xl px-4 py-2 shadow-lg">
      <button
        onClick={handleViewFromSeat}
        disabled={selectedSeats.length !== 1}
        className={`px-4 py-2 bg-${
          selectedSeats.length === 1 ? 'blue-600' : 'gray-400'
        } hover:bg-${
          selectedSeats.length === 1 ? 'blue-700' : 'gray-500'
        } text-white font-medium rounded disabled:cursor-not-allowed disabled:opacity-50`}
      >
        View from Seat
      </button>
      <button
        onClick={() => {
          setCameraTarget(null)
          setCameraMode('overview')
          // Reset camera position
          const { camera } = useThree()
          camera.position.set(0, 10, 20)
          camera.lookAt(0, 0, 0)
        }}
        className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded"
      >
        Back to Stadium
      </button>
    </div>
  )
}

export default ViewFromSeatButton