import { useThree } from '@react-three/fiber'
import { useStadiumStore } from '../../store/stadiumStore'

interface CameraControlsProps {
  cameraMode: 'overview' | 'section' | 'seat'
  setCameraMode: (mode: 'overview' | 'section' | 'seat') => void
  cameraTarget: THREE.Vector3 | null
  setCameraTarget: (target: THREE.Vector3 | null) => void
}

const CameraControls: React.FC<CameraControlsProps> = ({
  cameraMode,
  setCameraMode,
  cameraTarget,
  setCameraTarget
}) => {
  const { camera } = useThree()

  const handleOverviewClick = () => {
    setCameraMode('overview')
    setCameraTarget(null)
    // Reset to default overview position
    camera.position.set(0, 15, 25)
    camera.lookAt(0, 0, 0)
  }

  const handleSectionClick = (sectionName: string) => {
    setCameraMode('section')
    // In a real implementation, we'd calculate the section center
    // For now, we'll use a simplified approach
    setCameraTarget(new THREE.Vector3(0, 0, 0))
    // Position camera to side view
    camera.position.set(20, 10, 0)
    camera.lookAt(0, 0, 0)
  }

  return (
    <div className="absolute top-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
      <button
        onClick={handleOverviewClick}
        className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-${
          cameraMode === 'overview' ? 'full' : 'none'
        } bg-${cameraMode === 'overview' ? 'blue-600' : 'blue-100'} text-${
          cameraMode === 'overview' ? 'white' : 'blue-600'
        } hover:bg-${cameraMode === 'overview' ? 'blue-700' : 'blue-200'}`}
      >
        Overview
      </button>
      <button
        onClick={() => handleSectionClick('north')}
        className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-${
          cameraMode === 'section' ? 'full' : 'none'
        } bg-${cameraMode === 'section' ? 'blue-600' : 'blue-100'} text-${
          cameraMode === 'section' ? 'white' : 'blue-600'
        } hover:bg-${cameraMode === 'section' ? 'blue-700' : 'blue-200'}`}
      >
        North Stand
      </button>
      <button
        onClick={() => handleSectionClick('south')}
        className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-${
          cameraMode === 'section' ? 'full' : 'none'
        } bg-${cameraMode === 'section' ? 'blue-600' : 'blue-100'} text-${
          cameraMode === 'section' ? 'white' : 'blue-600'
        } hover:bg-${cameraMode === 'section' ? 'blue-700' : 'blue-200'}`}
      >
        South Stand
      </button>
      <button
        onClick={() => handleSectionClick('east')}
        className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-${
          cameraMode === 'section' ? 'full' : 'none'
        } bg-${cameraMode === 'section' ? 'blue-600' : 'blue-100'} text-${
          cameraMode === 'section' ? 'white' : 'blue-600'
        } hover:bg-${cameraMode === 'section' ? 'blue-700' : 'blue-200'}`}
      >
        East Stand
      </button>
      <button
        onClick={() => handleSectionClick('west')}
        className={`px-3 py-1.5 text-sm font-medium transition-colors rounded-${
          cameraMode === 'section' ? 'full' : 'none'
        } bg-${cameraMode === 'section' ? 'blue-600' : 'blue-100'} text-${
          cameraMode === 'section' ? 'white' : 'blue-600'
        } hover:bg-${cameraMode === 'section' ? 'blue-700' : 'blue-200'}`}
      >
        West Stand
      </button>
    </div>
  )
}

export default CameraControls