import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls, Sky } from '@react-three/drei'
import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'

export type CricketSeat = {
  id: string
  sectionId: string
  sectionName: string
  block: string
  tier: string
  rowNumber: number
  seatNumber: number
  seatLabel: string
  status: 'AVAILABLE' | 'BOOKED' | 'BLOCKED'
  category: string
  price: number
  positionX: number
  positionY: number
  positionZ: number
  distanceFromPitch: number
  viewingQuality: number
}

type CricketStadiumSceneProps = {
  stadiumName: string
  teamA: string
  teamB: string
  seats: CricketSeat[]
  selectedSeatIds: string[]
  hoveredSeatId: string | null
  focusedSeat: CricketSeat | null
  cameraMode: 'overview' | 'section' | 'seat' | 'exterior'
  nightMode: boolean
  onSeatClick: (seat: CricketSeat) => void
  onSeatHover: (seat: CricketSeat | null) => void
}

const statusColors = {
  AVAILABLE: '#27bd78',
  BOOKED: '#7b8791',
  BLOCKED: '#e69a42',
  SELECTED: '#ffd166',
} as const

const groundRadiusX = 49
const groundRadiusZ = 37

function ellipsePoint(angle: number, radiusX: number, radiusZ: number, height: number) {
  return new THREE.Vector3(Math.cos(angle) * radiusX, height, Math.sin(angle) * radiusZ)
}

function StadiumTier({
  innerRadiusX,
  innerRadiusZ,
  outerRadiusX,
  outerRadiusZ,
  baseHeight,
  topHeight,
  material,
}: {
  innerRadiusX: number
  innerRadiusZ: number
  outerRadiusX: number
  outerRadiusZ: number
  baseHeight: number
  topHeight: number
  material: THREE.Material
}) {
  const geometry = useMemo(() => {
    const points = 192
    const rows = 8
    const positions: number[] = []
    const indices: number[] = []

    for (let row = 0; row <= rows; row += 1) {
      const t = row / rows
      const rx = THREE.MathUtils.lerp(innerRadiusX, outerRadiusX, t)
      const rz = THREE.MathUtils.lerp(innerRadiusZ, outerRadiusZ, t)
      const y = THREE.MathUtils.lerp(baseHeight, topHeight, t)

      for (let point = 0; point <= points; point += 1) {
        const angle = (point / points) * Math.PI * 2
        positions.push(Math.cos(angle) * rx, y, Math.sin(angle) * rz)
      }
    }

    for (let row = 0; row < rows; row += 1) {
      for (let point = 0; point < points; point += 1) {
        const a = row * (points + 1) + point
        const b = a + points + 1
        indices.push(a, b, a + 1, b, b + 1, a + 1)
      }
    }

    const result = new THREE.BufferGeometry()
    result.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    result.setIndex(indices)
    result.computeVertexNormals()
    return result
  }, [baseHeight, innerRadiusX, innerRadiusZ, outerRadiusX, outerRadiusZ, topHeight])

  return <mesh geometry={geometry} material={material} castShadow receiveShadow />
}

function StadiumWall({
  radiusX,
  radiusZ,
  bottom,
  top,
  color,
}: {
  radiusX: number
  radiusZ: number
  bottom: number
  top: number
  color: string
}) {
  const geometry = useMemo(() => {
    const segments = 192
    const positions: number[] = []
    const indices: number[] = []

    for (let segment = 0; segment <= segments; segment += 1) {
      const angle = (segment / segments) * Math.PI * 2
      const x = Math.cos(angle) * radiusX
      const z = Math.sin(angle) * radiusZ
      positions.push(x, bottom, z, x, top, z)
    }

    for (let segment = 0; segment < segments; segment += 1) {
      const lower = segment * 2
      const upper = lower + 1
      const nextLower = lower + 2
      const nextUpper = lower + 3
      indices.push(lower, nextLower, upper, upper, nextLower, nextUpper)
    }

    const wall = new THREE.BufferGeometry()
    wall.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    wall.setIndex(indices)
    wall.computeVertexNormals()
    return wall
  }, [bottom, radiusX, radiusZ, top])

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color={color} metalness={0.2} roughness={0.78} side={THREE.DoubleSide} />
    </mesh>
  )
}

function EllipseRing({
  radiusX,
  radiusZ,
  y,
  color,
  tube = 0.28,
}: {
  radiusX: number
  radiusZ: number
  y: number
  color: THREE.ColorRepresentation
  tube?: number
}) {
  const curve = useMemo(() => {
    const points = Array.from({ length: 96 }, (_, index) => {
      const angle = (index / 96) * Math.PI * 2
      return ellipsePoint(angle, radiusX, radiusZ, y)
    })
    return new THREE.CatmullRomCurve3(points, true, 'centripetal')
  }, [radiusX, radiusZ, y])

  return (
    <mesh>
      <tubeGeometry args={[curve, 192, tube, 8, true]} />
      <meshStandardMaterial color={color} roughness={0.74} metalness={0.12} />
    </mesh>
  )
}

function StadiumCanopy() {
  const geometry = useMemo(() => {
    const points = 192
    const rows = 12
    const positions: number[] = []
    const indices: number[] = []

    for (let row = 0; row <= rows; row += 1) {
      const t = row / rows
      const radiusFactor = THREE.MathUtils.lerp(0.965, 1, t)
      const y = THREE.MathUtils.lerp(59, 54, t)
      for (let point = 0; point <= points; point += 1) {
        const angle = (point / points) * Math.PI * 2
        positions.push(Math.cos(angle) * 94 * radiusFactor, y, Math.sin(angle) * 70 * radiusFactor)
      }
    }

    for (let row = 0; row < rows; row += 1) {
      for (let point = 0; point < points; point += 1) {
        const a = row * (points + 1) + point
        const b = a + points + 1
        indices.push(a, a + 1, b, a + 1, b + 1, b)
      }
    }

    const canopy = new THREE.BufferGeometry()
    canopy.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    canopy.setIndex(indices)
    canopy.computeVertexNormals()
    return canopy
  }, [])

  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial color="#8b9ba1" metalness={0.28} roughness={0.56} side={THREE.DoubleSide} />
    </mesh>
  )
}

function PavilionGable({
  width,
  height,
}: {
  width: number
  height: number
}) {
  const shape = useMemo(() => {
    const result = new THREE.Shape()
    result.moveTo(-width / 2, 0)
    result.lineTo(0, height)
    result.lineTo(width / 2, 0)
    result.closePath()
    return result
  }, [height, width])

  return (
    <shapeGeometry args={[shape]} />
  )
}

function LordsPavilionNameplate() {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 96
    const context = canvas.getContext('2d')

    if (context) {
      context.fillStyle = '#344d3c'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.fillStyle = '#f0e4cc'
      context.font = 'bold 38px Georgia'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText("LORD'S PAVILION", canvas.width / 2, canvas.height / 2)
    }

    const result = new THREE.CanvasTexture(canvas)
    result.colorSpace = THREE.SRGBColorSpace
    return result
  }, [])

  return (
    <mesh position={[0, 10.8, 6.9]}>
      <planeGeometry args={[9.5, 1.5]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  )
}

function LordsPavilion() {
  const windowPositions = [-18, -12, -6, 6, 12, 18]

  return (
    <group position={[0, 0, -49]} scale={[1.15, 1.08, 1]}>
      <mesh position={[0, 1.2, 0]} castShadow receiveShadow>
        <boxGeometry args={[48, 2.4, 15]} />
        <meshStandardMaterial color="#a8553f" roughness={0.9} />
      </mesh>
      <mesh position={[0, 15, 0]} castShadow receiveShadow>
        <boxGeometry args={[45, 25, 13]} />
        <meshStandardMaterial color="#a66a56" roughness={0.9} />
      </mesh>

      {[4, 11, 18, 25].map((height) => (
        <mesh key={height} position={[0, height, 6.62]}>
          <boxGeometry args={[45.5, 0.55, 0.45]} />
          <meshStandardMaterial color={height === 25 ? '#465a43' : '#e4d6ba'} roughness={0.78} />
        </mesh>
      ))}

      {[7, 14, 21].map((height) =>
        windowPositions.map((x) => (
          <group key={`${height}-${x}`} position={[x, height, 6.68]}>
            <mesh>
              <boxGeometry args={[2.8, 4.1, 0.24]} />
              <meshStandardMaterial color="#f0e5cf" roughness={0.78} />
            </mesh>
            <mesh position={[0, 0, 0.14]}>
              <boxGeometry args={[2.15, 3.45, 0.08]} />
              <meshStandardMaterial color="#315747" roughness={0.35} metalness={0.12} />
            </mesh>
            <mesh position={[0, 0, 0.2]}>
              <boxGeometry args={[0.12, 3.45, 0.06]} />
              <meshStandardMaterial color="#e8ddc7" roughness={0.7} />
            </mesh>
            <mesh position={[0, 0, 0.2]}>
              <boxGeometry args={[2.15, 0.12, 0.06]} />
              <meshStandardMaterial color="#e8ddc7" roughness={0.7} />
            </mesh>
          </group>
        )),
      )}

      <mesh position={[0, 6.3, 6.78]}>
        <boxGeometry args={[5.1, 6.3, 0.38]} />
        <meshStandardMaterial color="#344d3c" roughness={0.72} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 1.27, 6.3, 7.0]}>
          <boxGeometry args={[0.12, 6.2, 0.1]} />
          <meshStandardMaterial color="#d9c9aa" roughness={0.75} />
        </mesh>
      ))}
      <LordsPavilionNameplate />

      <mesh position={[0, 25.2, 6.7]}>
        <boxGeometry args={[19, 0.6, 14]} />
        <meshStandardMaterial color="#40533e" roughness={0.82} />
      </mesh>
      <mesh position={[0, 25.5, 6.9]}>
        <PavilionGable width={19} height={8} />
        <meshStandardMaterial color="#9d4638" side={THREE.DoubleSide} roughness={0.82} />
      </mesh>
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 5.5, 29.5, 6.2]} rotation={[0, 0, -side * 0.63]} castShadow>
          <boxGeometry args={[11.5, 0.8, 14]} />
          <meshStandardMaterial color="#40533e" roughness={0.76} />
        </mesh>
      ))}

      <mesh position={[0, 29.2, 7.1]}>
        <circleGeometry args={[1.45, 32]} />
        <meshStandardMaterial color="#f0e4cc" roughness={0.64} />
      </mesh>
      <mesh position={[0, 29.2, 7.22]}>
        <circleGeometry args={[1.12, 32]} />
        <meshStandardMaterial color="#344d3c" roughness={0.6} />
      </mesh>
      <mesh position={[0, 29.62, 7.3]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.1, 0.85, 0.06]} />
        <meshStandardMaterial color="#f0e4cc" />
      </mesh>
      <mesh position={[0.25, 29.12, 7.3]} rotation={[0, 0, 0.5]}>
        <boxGeometry args={[0.1, 0.62, 0.06]} />
        <meshStandardMaterial color="#f0e4cc" />
      </mesh>
      <mesh position={[0, 29.2, 7.34]}>
        <sphereGeometry args={[0.12, 12, 12]} />
        <meshStandardMaterial color="#f0e4cc" />
      </mesh>
    </group>
  )
}

function ParkingCar({
  position,
  color,
}: {
  position: [number, number, number]
  color: string
}) {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]} castShadow>
        <boxGeometry args={[3.7, 0.9, 1.72]} />
        <meshStandardMaterial color={color} metalness={0.32} roughness={0.4} />
      </mesh>
      <mesh position={[-0.25, 1.32, 0]}>
        <boxGeometry args={[1.95, 0.58, 1.42]} />
        <meshStandardMaterial color="#a9c5d0" metalness={0.24} roughness={0.22} />
      </mesh>
      {[-1, 1].flatMap((side) =>
        [-1.05, 1.05].map((axle) => (
          <mesh
            key={`${side}-${axle}`}
            position={[axle, 0.4, side * 0.8]}
            rotation={[Math.PI / 2, 0, 0]}
          >
            <cylinderGeometry args={[0.32, 0.32, 0.18, 12]} />
            <meshStandardMaterial color="#283039" roughness={0.9} />
          </mesh>
        )),
      )}
      <mesh position={[1.87, 0.82, 0]}>
        <boxGeometry args={[0.08, 0.18, 0.5]} />
        <meshStandardMaterial color="#f6e5bc" emissive="#f6e5bc" emissiveIntensity={0.15} />
      </mesh>
    </group>
  )
}

function ParkingLot({
  position,
  rotation = 0,
  seed,
}: {
  position: [number, number, number]
  rotation?: number
  seed: number
}) {
  const carColors = ['#f0eee5', '#52616a', '#b84d3f', '#d1ad52', '#376477', '#56634f', '#d1d5d7']
  const carSlots = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => {
        const row = Math.floor(index / 12)
        const column = index % 12
        const occupied = ((index * 17 + seed * 11) % 10) < 6
        return {
          row,
          column,
          occupied,
          color: carColors[(index * 7 + seed * 3) % carColors.length],
        }
      }),
    [seed],
  )

  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <mesh position={[0, -0.03, 0]} receiveShadow>
        <boxGeometry args={[98, 0.24, 66]} />
        <meshStandardMaterial color="#aaa99f" roughness={0.94} />
      </mesh>
      <mesh position={[0, 0.095, 0]}>
        <boxGeometry args={[98, 0.03, 12]} />
        <meshStandardMaterial color="#646b69" roughness={0.94} />
      </mesh>

      {Array.from({ length: 15 }, (_, index) => {
        const x = (index - 7) * 6.3
        return (
          <group key={`bay-${index}`}>
            {[-1, 1].map((side) => (
              <mesh key={side} position={[x, 0.115, side * 18]}>
                <boxGeometry args={[0.12, 0.035, 15]} />
                <meshStandardMaterial color="#f3f0df" roughness={0.85} />
              </mesh>
            ))}
            <mesh position={[x, 0.115, 0]}>
              <boxGeometry args={[0.12, 0.035, 11]} />
              <meshStandardMaterial color="#f3f0df" roughness={0.85} />
            </mesh>
          </group>
        )
      })}

      {carSlots
        .filter((slot) => slot.occupied)
        .map((slot) => (
          <ParkingCar
            key={`${slot.row}-${slot.column}`}
            position={[(slot.column - 5.5) * 6.3, 0.12, (slot.row - 1) * 19]}
            color={slot.color}
          />
        ))}

      <group position={[-38, 1.4, -25]}>
        <mesh>
          <boxGeometry args={[10, 2.2, 0.45]} />
          <meshStandardMaterial color="#225b57" />
        </mesh>
        <mesh position={[0, 0, 0.28]}>
          <boxGeometry args={[8.7, 1.45, 0.08]} />
          <meshStandardMaterial color="#d9e5ce" emissive="#8dbb88" emissiveIntensity={0.14} />
        </mesh>
      </group>
    </group>
  )
}

function StadiumExterior() {
  const treePositions = useMemo(
    () =>
      Array.from({ length: 36 }, (_, index) => {
        const angle = (index / 36) * Math.PI * 2
        const radius = index % 2 === 0 ? 143 : 158
        return {
          x: Math.cos(angle) * radius,
          z: Math.sin(angle) * radius * 0.76,
          scale: 0.82 + (index % 4) * 0.11,
          hue: index % 3,
        }
      }),
    [],
  )

  const entryAngles = useMemo(
    () => Array.from({ length: 16 }, (_, index) => (index / 16) * Math.PI * 2),
    [],
  )

  return (
    <group>
      <StadiumWall radiusX={94} radiusZ={70} bottom={1} top={47} color="#b7b8ad" />
      <EllipseRing radiusX={94.4} radiusZ={70.3} y={4.2} color="#d1d1c7" tube={1.25} />
      <EllipseRing radiusX={94.6} radiusZ={70.5} y={18.5} color="#858f93" tube={0.78} />
      <EllipseRing radiusX={94.8} radiusZ={70.8} y={34.5} color="#d5d2c5" tube={1.05} />
      <EllipseRing radiusX={95} radiusZ={71} y={47} color="#919a9c" tube={0.86} />

      {Array.from({ length: 48 }, (_, index) => {
        const angle = (index / 48) * Math.PI * 2
        const radiusX = 94.7
        const radiusZ = 70.7
        const x = Math.cos(angle) * radiusX
        const z = Math.sin(angle) * radiusZ
        const yaw = -angle

        return (
          <group key={`facade-${index}`} position={[x, 0, z]} rotation={[0, yaw, 0]}>
            <mesh position={[0, 11.2, 0.14]}>
              <boxGeometry args={[8.1, 7.6, 0.22]} />
              <meshStandardMaterial
                color={index % 4 === 0 ? '#476a72' : '#6f898d'}
                emissive="#203d46"
                emissiveIntensity={0.18}
                metalness={0.26}
                roughness={0.34}
              />
            </mesh>
            <mesh position={[0, 5.7, 0.3]}>
              <boxGeometry args={[3.2, 4.2, 0.34]} />
              <meshStandardMaterial color={index % 4 === 0 ? '#d8c8a8' : '#eee8d9'} roughness={0.7} />
            </mesh>
            <mesh position={[0, 24.8, 0.16]}>
              <boxGeometry args={[7.9, 5.8, 0.24]} />
              <meshStandardMaterial
                color={index % 3 === 0 ? '#8ca7aa' : '#607a82'}
                emissive="#29464e"
                emissiveIntensity={0.2}
                metalness={0.2}
                roughness={0.4}
              />
            </mesh>
            <mesh position={[0, 39.7, 0.14]}>
              <boxGeometry args={[8, 9, 0.2]} />
              <meshStandardMaterial color={index % 2 === 0 ? '#a9aaa0' : '#929a97'} roughness={0.76} />
            </mesh>
            <mesh position={[0, 16.7, 0.35]}>
              <boxGeometry args={[0.42, 27, 0.56]} />
              <meshStandardMaterial color="#e6e0d2" metalness={0.18} roughness={0.6} />
            </mesh>
          </group>
        )
      })}

      {entryAngles.map((angle, index) => {
        const x = Math.cos(angle) * 97
        const z = Math.sin(angle) * 72
        const yaw = -angle
        return (
          <group key={`gate-${index}`} position={[x, 0, z]} rotation={[0, yaw, 0]}>
            <mesh position={[0, 3, 0]}>
              <boxGeometry args={[10, 6, 2.2]} />
              <meshStandardMaterial color="#e2dccd" roughness={0.74} />
            </mesh>
            <mesh position={[0, 5.2, 1.2]}>
              <boxGeometry args={[7, 0.6, 0.18]} />
              <meshStandardMaterial color="#d8ba72" emissive="#d8ba72" emissiveIntensity={0.16} />
            </mesh>
            <mesh position={[0, 1.4, 1.14]}>
              <boxGeometry args={[3.4, 2.8, 0.12]} />
              <meshStandardMaterial color="#274e58" roughness={0.6} />
            </mesh>
          </group>
        )
      })}

      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.22, 0]} receiveShadow>
        <circleGeometry args={[132, 128]} />
        <meshStandardMaterial color="#b8b7aa" roughness={0.94} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.18, 0]} scale={[128, 96, 1]}>
        <circleGeometry args={[1, 128]} />
        <meshStandardMaterial color="#718965" roughness={1} />
      </mesh>
      <EllipseRing radiusX={112} radiusZ={85} y={-0.12} color="#e1dfd2" tube={1.8} />
      <EllipseRing radiusX={123} radiusZ={93} y={-0.1} color="#5d6461" tube={4.2} />
      <EllipseRing radiusX={132} radiusZ={100} y={-0.08} color="#dedbcf" tube={1.6} />

      <ParkingLot position={[149, 0, 126]} rotation={0.52} seed={1} />
      <ParkingLot position={[-149, 0, -126]} rotation={0.52} seed={2} />
      <ParkingLot position={[-149, 0, 126]} rotation={-0.52} seed={3} />
      <ParkingLot position={[149, 0, -126]} rotation={-0.52} seed={4} />

      {treePositions.map((tree, index) => (
        <group key={`tree-${index}`} position={[tree.x, 0, tree.z]} scale={tree.scale}>
          <mesh position={[0, 2.2, 0]} castShadow>
            <cylinderGeometry args={[0.38, 0.62, 4.4, 8]} />
            <meshStandardMaterial color="#745b41" roughness={0.95} />
          </mesh>
          {[0, 1, 2].map((layer) => (
            <mesh key={layer} position={[0, 4.6 + layer * 1.25, 0]} castShadow>
              <coneGeometry args={[2.6 - layer * 0.52, 3.2, 9]} />
              <meshStandardMaterial
                color={tree.hue === 0 ? '#47744d' : tree.hue === 1 ? '#5d8252' : '#3f6949'}
                roughness={0.95}
              />
            </mesh>
          ))}
        </group>
      ))}

      {Array.from({ length: 10 }, (_, index) => {
        const angle = (index / 10) * Math.PI * 2
        const x = Math.cos(angle) * 117
        const z = Math.sin(angle) * 89
        return (
          <group key={`plaza-light-${index}`} position={[x, 0, z]}>
            <mesh position={[0, 5, 0]}>
              <cylinderGeometry args={[0.12, 0.2, 10, 8]} />
              <meshStandardMaterial color="#56636a" metalness={0.6} roughness={0.48} />
            </mesh>
            <mesh position={[0, 10.2, 0]}>
              <boxGeometry args={[1.2, 0.2, 0.55]} />
              <meshStandardMaterial color="#fff4cf" emissive="#fff0c4" emissiveIntensity={0.8} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function CricketField({
  stadiumName,
  teamA,
  teamB,
}: {
  stadiumName: string
  teamA: string
  teamB: string
}) {
  const mowingBands = Array.from({ length: 7 }, (_, index) => index)
  const grassTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const context = canvas.getContext('2d')

    if (context) {
      context.fillStyle = '#377d4a'
      context.fillRect(0, 0, canvas.width, canvas.height)
      let seed = 72631
      const random = () => {
        seed = (seed * 16807) % 2147483647
        return (seed - 1) / 2147483646
      }

      for (let blade = 0; blade < 9000; blade += 1) {
        const x = random() * canvas.width
        const y = random() * canvas.height
        const shade = random() > 0.52 ? '#75a65c' : '#245f3d'
        context.strokeStyle = shade
        context.globalAlpha = 0.12 + random() * 0.2
        context.lineWidth = 0.5 + random()
        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(x + (random() - 0.5) * 2, y - 2 - random() * 5)
        context.stroke()
      }
      context.globalAlpha = 1
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(8, 7)
    texture.anisotropy = 8
    return texture
  }, [])
  const wicketTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 512
    const context = canvas.getContext('2d')

    if (context) {
      context.fillStyle = '#ad956e'
      context.fillRect(0, 0, canvas.width, canvas.height)
      let seed = 19531
      const random = () => {
        seed = (seed * 16807) % 2147483647
        return (seed - 1) / 2147483646
      }

      for (let mark = 0; mark < 5200; mark += 1) {
        const x = random() * canvas.width
        const y = random() * canvas.height
        context.strokeStyle = random() > 0.5 ? '#d2bc93' : '#78654f'
        context.globalAlpha = 0.08 + random() * 0.17
        context.lineWidth = 0.6 + random() * 2.2
        context.beginPath()
        context.moveTo(x, y)
        context.lineTo(x + (random() - 0.5) * 26, y + (random() - 0.5) * 4)
        context.stroke()
      }
      context.globalAlpha = 1
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    texture.wrapS = THREE.RepeatWrapping
    texture.wrapT = THREE.RepeatWrapping
    texture.repeat.set(2, 5)
    texture.anisotropy = 8
    return texture
  }, [])

  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.4, 0]} receiveShadow>
        <circleGeometry args={[145, 128]} />
        <meshStandardMaterial color="#718166" roughness={1} />
      </mesh>
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
        scale={[groundRadiusX, groundRadiusZ, 1]}
        receiveShadow
      >
        <circleGeometry args={[1, 128]} />
        <meshStandardMaterial map={grassTexture} color="#d5e2c4" roughness={1} />
      </mesh>
      {mowingBands.map((band) => {
        const inner = 7 + band * 5.6
        const outer = inner + 2.8
        return (
          <mesh
            key={band}
            rotation={[-Math.PI / 2, 0, 0]}
            position={[0, 0.012 + band * 0.001, 0]}
            scale={[1, groundRadiusZ / groundRadiusX, 1]}
          >
            <ringGeometry args={[inner, outer, 128]} />
            <meshStandardMaterial
              color={band % 2 === 0 ? '#2d814d' : '#2a7948'}
              roughness={1}
              side={THREE.DoubleSide}
            />
          </mesh>
        )
      })}
      <EllipseRing radiusX={groundRadiusX} radiusZ={groundRadiusZ} y={0.18} color="#f4f0d8" tube={0.22} />
      <EllipseRing radiusX={groundRadiusX - 0.8} radiusZ={groundRadiusZ - 0.6} y={0.16} color="#dce5c6" tube={0.09} />
      <AdvertisementBoards />

      <mesh position={[0, 0.055, 0]} receiveShadow>
        <boxGeometry args={[6.8, 0.11, 25.8]} />
        <meshStandardMaterial map={wicketTexture} color="#d5c4a0" roughness={1} />
      </mesh>
      <mesh position={[0, 0.125, 0]} receiveShadow>
        <boxGeometry args={[3.05, 0.045, 20.12]} />
        <meshStandardMaterial map={wicketTexture} color="#e3d4b6" roughness={1} />
      </mesh>
      {[-1, 1].map((end) => (
        <group key={end} position={[0, 0.2, end * 8.8]}>
          <mesh position={[-0.19, 0.37, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.75, 10]} />
            <meshStandardMaterial color="#f3eee0" roughness={0.42} />
          </mesh>
          <mesh position={[0, 0.37, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.75, 10]} />
            <meshStandardMaterial color="#f3eee0" roughness={0.42} />
          </mesh>
          <mesh position={[0.19, 0.37, 0]}>
            <cylinderGeometry args={[0.075, 0.075, 0.75, 10]} />
            <meshStandardMaterial color="#f3eee0" roughness={0.42} />
          </mesh>
          <mesh position={[0, 0.77, 0]}>
            <boxGeometry args={[0.62, 0.07, 0.11]} />
            <meshStandardMaterial color="#efe9da" />
          </mesh>
          {[-1, 1].map((creaseEnd) => (
            <group key={`crease-${creaseEnd}`} position={[0, 0, creaseEnd * 1.22]}>
              <mesh position={[0, 0.04, 0]}>
                <boxGeometry args={[2.64, 0.035, 0.085]} />
                <meshStandardMaterial color="#fffdf5" roughness={0.82} />
              </mesh>
              {[-1, 1].map((side) => (
                <mesh key={side} position={[side * 1.32, 0.04, -creaseEnd * 1.15]}>
                  <boxGeometry args={[0.085, 0.035, 2.3]} />
                  <meshStandardMaterial color="#fffdf5" roughness={0.82} />
                </mesh>
              ))}
            </group>
          ))}
          <mesh position={[0, 0.04, 0]}>
            <boxGeometry args={[2.64, 0.035, 0.06]} />
            <meshStandardMaterial color="#e9e4d7" roughness={0.82} />
          </mesh>
          <mesh position={[0, 0.04, -end * 0.55]}>
            <boxGeometry args={[0.045, 0.035, 0.42]} />
            <meshStandardMaterial color="#d8c9aa" roughness={0.9} />
          </mesh>
        </group>
      ))}

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 5.2, 0.24, 0]}>
          <boxGeometry args={[0.8, 0.36, 8]} />
          <meshStandardMaterial color="#ced7bb" roughness={0.9} />
        </mesh>
      ))}

      <TeamDugout position={[-14, 0, 31.4]} label={`${teamA} Dugout`} accent="#168b57" />
      <TeamDugout position={[14, 0, 31.4]} label={`${teamB} Dugout`} accent="#8e3e55" />
      <ScoreDisplay stadiumName={stadiumName} teamA={teamA} teamB={teamB} />
    </group>
  )
}

function AdvertisementBoards() {
  const messages = useMemo(
    () => [
      { title: 'CRICKETVERSE', subtitle: 'LIVE THE GAME', accent: '#39e0a2' },
      { title: 'MATCH DAY', subtitle: 'EVERY BALL MATTERS', accent: '#f3bd55' },
      { title: 'BOUNDARY CLUB', subtitle: 'MAKE SOME NOISE', accent: '#55c9f4' },
      { title: 'PLAY BOLD', subtitle: 'CHASE THE MOMENT', accent: '#ff6f73' },
    ],
    [],
  )
  const textures = useMemo(
    () =>
      messages.map(({ title, subtitle, accent }) => {
        const canvas = document.createElement('canvas')
        canvas.width = 768
        canvas.height = 192
        const context = canvas.getContext('2d')

        if (context) {
          const background = context.createLinearGradient(0, 0, canvas.width, canvas.height)
          background.addColorStop(0, '#071b2a')
          background.addColorStop(1, '#123b48')
          context.fillStyle = background
          context.fillRect(0, 0, canvas.width, canvas.height)
          context.fillStyle = accent
          context.fillRect(0, 0, 14, canvas.height)
          context.beginPath()
          context.moveTo(600, 0)
          context.lineTo(768, 0)
          context.lineTo(768, 192)
          context.lineTo(680, 192)
          context.closePath()
          context.fillStyle = accent
          context.globalAlpha = 0.15
          context.fill()
          context.globalAlpha = 1
          context.fillStyle = '#f5f8f6'
          context.font = 'bold 58px Arial'
          context.fillText(title, 38, 94)
          context.fillStyle = accent
          context.font = 'bold 25px Arial'
          context.fillText(subtitle, 42, 148)
        }

        const texture = new THREE.CanvasTexture(canvas)
        texture.colorSpace = THREE.SRGBColorSpace
        return texture
      }),
    [messages],
  )

  return (
    <group>
      {Array.from({ length: 28 }, (_, index) => {
        const angle = (index / 28) * Math.PI * 2
        const x = Math.cos(angle) * (groundRadiusX + 1.1)
        const z = Math.sin(angle) * (groundRadiusZ + 1.1)
        const normalX = -Math.cos(angle) / (groundRadiusX + 1.1)
        const normalZ = -Math.sin(angle) / (groundRadiusZ + 1.1)
        const rotation = Math.atan2(normalX, normalZ)
        const texture = textures[index % textures.length]

        return (
          <group key={index} position={[x, 1.35, z]} rotation={[0, rotation, 0]}>
            <mesh position={[0, 0, -0.14]} castShadow>
              <boxGeometry args={[10.4, 1.8, 0.32]} />
              <meshStandardMaterial color="#152a31" metalness={0.45} roughness={0.45} />
            </mesh>
            <mesh position={[0, 0, 0.03]}>
              <planeGeometry args={[10.1, 1.56]} />
              <meshBasicMaterial map={texture} toneMapped={false} />
            </mesh>
            <mesh position={[0, -1.15, 0]}>
              <boxGeometry args={[0.18, 0.48, 0.18]} />
              <meshStandardMaterial color="#66777a" metalness={0.55} roughness={0.5} />
            </mesh>
          </group>
        )
      })}
    </group>
  )
}

function CricketPoster({ title, accent }: { title: string; accent: string }) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 384
    canvas.height = 512
    const context = canvas.getContext('2d')

    if (context) {
      const background = context.createLinearGradient(0, 0, 384, 512)
      background.addColorStop(0, '#102235')
      background.addColorStop(0.62, '#23505a')
      background.addColorStop(1, '#0a1926')
      context.fillStyle = background
      context.fillRect(0, 0, 384, 512)

      context.fillStyle = accent
      context.globalAlpha = 0.2
      context.beginPath()
      context.arc(280, 130, 110, 0, Math.PI * 2)
      context.fill()
      context.globalAlpha = 1

      context.fillStyle = '#f5c96c'
      context.font = 'bold 20px Arial'
      context.fillText('CRICKETVERSE  /  PLAYER SERIES', 22, 36)
      context.fillStyle = accent
      context.fillRect(22, 52, 82, 5)

      context.fillStyle = '#f3d1a1'
      context.beginPath()
      context.arc(194, 137, 32, 0, Math.PI * 2)
      context.fill()

      context.fillStyle = accent
      context.beginPath()
      context.moveTo(144, 185)
      context.quadraticCurveTo(194, 160, 244, 185)
      context.lineTo(277, 330)
      context.lineTo(110, 330)
      context.closePath()
      context.fill()

      context.strokeStyle = '#e5d4b1'
      context.lineWidth = 22
      context.lineCap = 'round'
      context.beginPath()
      context.moveTo(154, 207)
      context.lineTo(100, 267)
      context.lineTo(80, 182)
      context.stroke()
      context.beginPath()
      context.moveTo(231, 210)
      context.lineTo(274, 253)
      context.stroke()

      context.save()
      context.translate(81, 138)
      context.rotate(-0.22)
      context.fillStyle = '#d8b986'
      context.fillRect(-8, 0, 16, 118)
      context.fillStyle = '#7c5a37'
      context.fillRect(-9, 0, 18, 25)
      context.restore()

      context.fillStyle = '#ffffff'
      context.font = 'bold 35px Arial'
      context.fillText(title.toUpperCase(), 22, 390)
      context.fillStyle = '#c6d3d5'
      context.font = 'bold 17px Arial'
      context.fillText('COURAGE  •  SKILL  •  THE GAME', 22, 426)
      context.fillStyle = accent
      context.fillRect(22, 454, 340, 3)
      context.fillStyle = '#e8eef0'
      context.font = '15px Arial'
      context.fillText('ORIGINAL PLAYER TRIBUTE ART', 22, 483)
    }

    const result = new THREE.CanvasTexture(canvas)
    result.colorSpace = THREE.SRGBColorSpace
    return result
  }, [accent, title])

  return (
    <group>
      <mesh position={[0, 0, -0.12]} castShadow>
        <boxGeometry args={[7.5, 9.5, 0.38]} />
        <meshStandardMaterial color="#d5e0e4" metalness={0.25} roughness={0.5} />
      </mesh>
      <mesh position={[0, 0, 0.1]}>
        <planeGeometry args={[7.1, 9.1]} />
        <meshBasicMaterial map={texture} toneMapped={false} />
      </mesh>
    </group>
  )
}

function CricketPosters() {
  const posters = useMemo(
    () => [
      { title: 'Virat Kohli', accent: '#2789ef' },
      { title: 'Rohit Sharma', accent: '#25b7a0' },
      { title: 'Fast Bowler', accent: '#51bde5' },
      { title: 'All-Rounder', accent: '#ee6f75' },
      { title: 'The Finisher', accent: '#bb8ce8' },
      { title: 'Spin Wizard', accent: '#77c879' },
      { title: 'Safe Hands', accent: '#e6a76b' },
      { title: 'Opening Star', accent: '#55c5c3' },
    ],
    [],
  )

  return (
    <group>
      {posters.map((poster, index) => {
        const angle = (index / posters.length) * Math.PI * 2
        const x = Math.cos(angle) * 75.5
        const z = Math.sin(angle) * 56.8
        const normalX = -Math.cos(angle) / 75.5
        const normalZ = -Math.sin(angle) / 56.8

        return (
          <group
            key={poster.title}
            position={[x, 29.6, z]}
            rotation={[0, Math.atan2(normalX, normalZ), 0]}
          >
            <CricketPoster {...poster} />
          </group>
        )
      })}
    </group>
  )
}

function Floodlight({ x, z, nightMode }: { x: number; z: number; nightMode: boolean }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position={[0, 27, 0]} castShadow>
        <cylinderGeometry args={[0.65, 1.1, 54, 10]} />
        <meshStandardMaterial color="#aab7c3" metalness={0.72} roughness={0.35} />
      </mesh>
      <mesh position={[0, 54.3, 0]}>
        <boxGeometry args={[5, 1.7, 1.1]} />
        <meshStandardMaterial color="#d2dbe2" metalness={0.55} roughness={0.3} />
      </mesh>
      {Array.from({ length: 12 }, (_, index) => (
        <mesh key={index} position={[(index % 6) * 0.72 - 1.8, 54.35, index < 6 ? -0.61 : 0.61]}>
          <boxGeometry args={[0.32, 0.35, 0.14]} />
          <meshStandardMaterial
            color="#f8f4d8"
            emissive="#fff0b2"
            emissiveIntensity={1.8}
            roughness={0.25}
          />
        </mesh>
      ))}
      <pointLight
        position={[0, 52, 0]}
        intensity={nightMode ? 650 : 32}
        distance={nightMode ? 150 : 72}
        color="#e6f2ff"
      />
      {nightMode && (
        <spotLight
          position={[0, 53, 0]}
          intensity={7200}
          distance={190}
          angle={0.72}
          penumbra={0.7}
          color="#e4f1ff"
        />
      )}
    </group>
  )
}

function ScoreDisplay({
  stadiumName,
  teamA,
  teamB,
}: {
  stadiumName: string
  teamA: string
  teamB: string
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 1024
    canvas.height = 320
    const context = canvas.getContext('2d')

    if (context) {
      const background = context.createLinearGradient(0, 0, 1024, 320)
      background.addColorStop(0, '#06162a')
      background.addColorStop(1, '#0b3342')
      context.fillStyle = background
      context.fillRect(0, 0, 1024, 320)
      context.fillStyle = '#8fffe0'
      context.font = 'bold 38px Arial'
      context.fillText(stadiumName.toUpperCase().slice(0, 28), 42, 65)
      context.fillStyle = '#f8fbff'
      context.font = 'bold 56px Arial'
      context.fillText(`${teamA.toUpperCase()}  VS  ${teamB.toUpperCase()}`.slice(0, 25), 42, 165)
      context.fillStyle = '#a8bfd1'
      context.font = '32px Arial'
      context.fillText('MATCHDAY · TICKETING DEMO', 42, 230)
      context.fillStyle = '#ffc857'
      context.font = 'bold 30px Arial'
      context.fillText('MATCHDAY', 820, 66)
    }

    const result = new THREE.CanvasTexture(canvas)
    result.colorSpace = THREE.SRGBColorSpace
    return result
  }, [])

  return (
    <>
      {[-1, 1].map((end) => (
        <group key={`scoreboard-${end}`} position={[0, 1.25, end * 43]} rotation={[0, end === 1 ? Math.PI : 0, 0]}>
          <mesh>
            <boxGeometry args={[17, 5.8, 0.8]} />
            <meshStandardMaterial color="#071526" emissive="#082a4a" emissiveIntensity={0.75} metalness={0.3} />
          </mesh>
          <mesh position={[0, 0, 0.42]}>
            <planeGeometry args={[15.8, 4.7]} />
            <meshBasicMaterial map={texture} toneMapped={false} />
          </mesh>
          <mesh position={[0, -3.3, 0]}>
            <boxGeometry args={[24, 1.2, 1.4]} />
            <meshStandardMaterial color="#e7edf1" emissive="#ced7dc" emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}
    </>
  )
}

function TeamDugout({
  position,
  label,
  accent,
}: {
  position: [number, number, number]
  label: string
  accent: string
}) {
  const labelTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 128
    const context = canvas.getContext('2d')

    if (context) {
      context.fillStyle = '#102b35'
      context.fillRect(0, 0, canvas.width, canvas.height)
      context.fillStyle = accent
      context.fillRect(0, 0, 12, canvas.height)
      context.fillStyle = '#f4f5ed'
      context.font = 'bold 48px Arial'
      context.textAlign = 'center'
      context.textBaseline = 'middle'
      context.fillText(label.toUpperCase(), canvas.width / 2, canvas.height / 2)
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    return texture
  }, [accent, label])

  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      <mesh position={[0, 0.24, 0]} receiveShadow>
        <boxGeometry args={[11.5, 0.42, 4.4]} />
        <meshStandardMaterial color="#b9b7a9" roughness={0.85} />
      </mesh>

      {[-5.2, 5.2].map((x) => (
        <group key={x} position={[x, 0, 0]}>
          <mesh position={[0, 1.45, -1.5]}>
            <boxGeometry args={[0.22, 2.9, 0.22]} />
            <meshStandardMaterial color="#596c72" metalness={0.4} roughness={0.45} />
          </mesh>
          <mesh position={[0, 1.45, 1.5]}>
            <boxGeometry args={[0.22, 2.9, 0.22]} />
            <meshStandardMaterial color="#596c72" metalness={0.4} roughness={0.45} />
          </mesh>
        </group>
      ))}

      <mesh position={[0, 3.05, 0]}>
        <boxGeometry args={[12.2, 0.28, 5.2]} />
        <meshStandardMaterial color="#c8c4b7" roughness={0.68} />
      </mesh>
      <mesh position={[0, 2.78, 2.15]}>
        <boxGeometry args={[11.6, 0.24, 0.22]} />
        <meshStandardMaterial color="#718287" metalness={0.3} roughness={0.48} />
      </mesh>

      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * 5.55, 1.48, 0.05]}>
          <boxGeometry args={[0.06, 2.45, 2.8]} />
          <meshPhysicalMaterial
            color="#b5d9dc"
            transparent
            opacity={0.22}
            roughness={0.08}
            metalness={0.12}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}

      {[-1, 0, 1].map((seatRow) => (
        <group key={seatRow} position={[0, 0.5, -0.78 + seatRow * 0.78]}>
          <mesh position={[0, 0.35, 0]}>
            <boxGeometry args={[8.4, 0.28, 0.48]} />
            <meshStandardMaterial color={accent} roughness={0.58} />
          </mesh>
          {Array.from({ length: 7 }, (_, seatIndex) => (
            <group key={seatIndex} position={[(seatIndex - 3) * 1.16, 0.62, 0]}>
              <mesh>
                <boxGeometry args={[0.82, 0.18, 0.65]} />
                <meshStandardMaterial color="#d9ded9" roughness={0.55} />
              </mesh>
              <mesh position={[0, 0.33, -0.24]} rotation={[-0.12, 0, 0]}>
                <boxGeometry args={[0.82, 0.58, 0.16]} />
                <meshStandardMaterial color="#e2e5df" roughness={0.52} />
              </mesh>
            </group>
          ))}
        </group>
      ))}

      <mesh position={[0, 2.3, 2.82]}>
        <planeGeometry args={[8.8, 1.55]} />
        <meshBasicMaterial map={labelTexture} toneMapped={false} />
      </mesh>
      <mesh position={[0, 2.3, 2.77]}>
        <boxGeometry args={[9.1, 1.82, 0.08]} />
        <meshStandardMaterial color="#1b3740" roughness={0.64} />
      </mesh>
    </group>
  )
}

function createSeatGeometry() {
  const parts: THREE.BufferGeometry[] = []
  const panShape = new THREE.Shape()
  panShape.moveTo(-0.38, 0.25)
  panShape.quadraticCurveTo(-0.42, 0.24, -0.42, 0.16)
  panShape.lineTo(-0.36, -0.3)
  panShape.quadraticCurveTo(-0.34, -0.37, -0.25, -0.38)
  panShape.lineTo(0.25, -0.38)
  panShape.quadraticCurveTo(0.34, -0.37, 0.36, -0.3)
  panShape.lineTo(0.42, 0.16)
  panShape.quadraticCurveTo(0.42, 0.24, 0.38, 0.25)
  panShape.closePath()
  const pan = new THREE.ExtrudeGeometry(panShape, {
    depth: 0.13,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.025,
    bevelThickness: 0.02,
    curveSegments: 6,
  })
  pan.rotateX(-Math.PI / 2)
  pan.translate(0, -0.01, 0)
  parts.push(pan)

  const backShape = new THREE.Shape()
  backShape.moveTo(-0.4, 0)
  backShape.lineTo(-0.43, 0.62)
  backShape.quadraticCurveTo(-0.44, 0.78, -0.31, 0.81)
  backShape.quadraticCurveTo(0, 0.85, 0.31, 0.81)
  backShape.quadraticCurveTo(0.44, 0.78, 0.43, 0.62)
  backShape.lineTo(0.4, 0)
  backShape.closePath()
  const back = new THREE.ExtrudeGeometry(backShape, {
    depth: 0.12,
    bevelEnabled: true,
    bevelSegments: 2,
    steps: 1,
    bevelSize: 0.025,
    bevelThickness: 0.02,
    curveSegments: 8,
  })
  back.rotateX(-0.1)
  back.translate(0, 0.04, -0.37)
  parts.push(back)

  const addBox = (
    width: number,
    height: number,
    depth: number,
    x: number,
    y: number,
    z: number,
    rotationX = 0,
  ) => {
    const geometry = new THREE.BoxGeometry(width, height, depth)
    geometry.rotateX(rotationX)
    geometry.translate(x, y, z)
    parts.push(geometry)
  }

  for (const side of [-1, 1]) {
    addBox(0.075, 0.34, 0.09, side * 0.29, -0.16, -0.2)
    addBox(0.08, 0.34, 0.09, side * 0.29, -0.16, 0.23)
    addBox(0.07, 0.075, 0.68, side * 0.45, 0.2, -0.01)
    addBox(0.07, 0.31, 0.08, side * 0.45, 0.04, 0.24)
    addBox(0.07, 0.35, 0.08, side * 0.39, 0.2, -0.29, -0.08)
  }

  const positions: number[] = []
  const indices: number[] = []
  let vertexOffset = 0

  parts.forEach((part) => {
    const position = part.getAttribute('position')
    for (let vertex = 0; vertex < position.count; vertex += 1) {
      positions.push(position.getX(vertex), position.getY(vertex), position.getZ(vertex))
    }
    const partIndices = part.getIndex()
    if (partIndices) {
      for (let index = 0; index < partIndices.count; index += 1) {
        indices.push(partIndices.getX(index) + vertexOffset)
      }
    } else {
      for (let index = 0; index < position.count; index += 1) {
        indices.push(index + vertexOffset)
      }
    }
    vertexOffset += position.count
    part.dispose()
  })

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  geometry.computeBoundingSphere()
  return geometry
}

function SeatInstances({
  seats,
  selectedSeatIds,
  hoveredSeatId,
  onSeatClick,
  onSeatHover,
}: {
  seats: CricketSeat[]
  selectedSeatIds: Set<string>
  hoveredSeatId: string | null
  onSeatClick: (seat: CricketSeat) => void
  onSeatHover: (seat: CricketSeat | null) => void
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const color = useMemo(() => new THREE.Color(), [])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const seatGeometry = useMemo(createSeatGeometry, [])

  useLayoutEffect(() => {
    if (!meshRef.current) return
    seats.forEach((seat, index) => {
      const yaw = Math.atan2(-seat.positionX, -seat.positionZ)
      dummy.position.set(seat.positionX, seat.positionY, seat.positionZ)
      dummy.rotation.set(0, yaw, 0)
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      meshRef.current?.setMatrixAt(index, dummy.matrix)
      const isSelected = selectedSeatIds.has(seat.id)
      const isHovered = hoveredSeatId === seat.id
      color.set(isSelected ? statusColors.SELECTED : isHovered ? '#e6f2ef' : statusColors[seat.status])
      meshRef.current?.setColorAt(index, color)
    })
    if (meshRef.current) {
      meshRef.current.instanceMatrix.needsUpdate = true
      if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
    }
  }, [color, dummy, hoveredSeatId, seats, selectedSeatIds])

  if (!seats.length) return null

  return (
    <>
      <instancedMesh
        ref={meshRef}
        args={[seatGeometry, undefined, seats.length]}
        castShadow
        receiveShadow
        onClick={(event) => {
          event.stopPropagation()
          if (event.instanceId !== undefined) onSeatClick(seats[event.instanceId])
        }}
        onPointerOver={(event) => {
          event.stopPropagation()
          if (event.instanceId !== undefined) onSeatHover(seats[event.instanceId])
        }}
        onPointerOut={(event) => {
          event.stopPropagation()
          onSeatHover(null)
        }}
      >
        <meshStandardMaterial roughness={0.64} metalness={0.025} />
      </instancedMesh>
    </>
  )
}

function CameraDirector({
  mode,
  focusedSeat,
}: {
  mode: CricketStadiumSceneProps['cameraMode']
  focusedSeat: CricketSeat | null
}) {
  const { camera } = useThree()
  const lastMode = useRef(mode)
  const lastSeatId = useRef(focusedSeat?.id ?? null)
  const isTransitioning = useRef(false)

  useEffect(() => {
    const nextSeatId = focusedSeat?.id ?? null
    if (lastMode.current !== mode || lastSeatId.current !== nextSeatId) {
      isTransitioning.current = mode !== 'overview' || lastMode.current !== 'overview'
      lastMode.current = mode
      lastSeatId.current = nextSeatId
    }
  }, [focusedSeat?.id, mode])

  useFrame((_, delta) => {
    if (!isTransitioning.current) return

    const overviewPosition = new THREE.Vector3(0, 200, 165)
    let targetPosition = overviewPosition
    let lookTarget = new THREE.Vector3(0, 8, 0)

    if (mode === 'exterior') {
      targetPosition = new THREE.Vector3(250, 100, 270)
      lookTarget = new THREE.Vector3(14, 10, 12)
    } else if (mode === 'seat' && focusedSeat) {
      targetPosition = new THREE.Vector3(
        focusedSeat.positionX,
        focusedSeat.positionY + 1.25,
        focusedSeat.positionZ,
      )
      lookTarget = new THREE.Vector3(0, 2, 0)
    } else if (mode === 'section' && focusedSeat) {
      const radial = new THREE.Vector3(focusedSeat.positionX, 0, focusedSeat.positionZ).normalize()
      targetPosition = radial.clone().multiplyScalar(100).add(new THREE.Vector3(0, 36, 0))
      lookTarget = radial.multiplyScalar(45).add(new THREE.Vector3(0, 13, 0))
    }

    const alpha = 1 - Math.exp(-delta * (mode === 'seat' ? 1.45 : mode === 'exterior' ? 0.58 : 0.95))
    camera.position.lerp(targetPosition, alpha)
    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(
      new THREE.Matrix4().lookAt(camera.position, lookTarget, camera.up),
    )
    camera.quaternion.slerp(targetQuaternion, alpha)
    if (camera.position.distanceTo(targetPosition) < 0.18) {
      camera.position.copy(targetPosition)
      camera.lookAt(lookTarget)
      isTransitioning.current = false
    }
  })

  return null
}

export default function CricketStadiumScene({
  stadiumName,
  teamA,
  teamB,
  seats,
  selectedSeatIds,
  hoveredSeatId,
  focusedSeat,
  cameraMode,
  nightMode,
  onSeatClick,
  onSeatHover,
}: CricketStadiumSceneProps) {
  const isLords = stadiumName.toLowerCase().includes("lord's")
  const selectedIds = useMemo(() => new Set(selectedSeatIds), [selectedSeatIds])
  const availableSeats = useMemo(() => seats.filter((seat) => seat.status === 'AVAILABLE'), [seats])
  const bookedSeats = useMemo(() => seats.filter((seat) => seat.status === 'BOOKED'), [seats])
  const blockedSeats = useMemo(() => seats.filter((seat) => seat.status === 'BLOCKED'), [seats])

  const lowerTierMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#7b898d', roughness: 0.84, side: THREE.DoubleSide }),
    [],
  )
  const middleTierMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#87979a', roughness: 0.82, side: THREE.DoubleSide }),
    [],
  )
  const upperTierMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: '#76898e', roughness: 0.8, side: THREE.DoubleSide }),
    [],
  )

  return (
    <>
      {nightMode ? (
        <>
          <color attach="background" args={['#071321']} />
          <fog attach="fog" args={['#101d2b', 190, 430]} />
          <ambientLight intensity={0.55} />
          <hemisphereLight args={['#9bb7d0', '#233323', 0.78]} />
          <directionalLight position={[-35, 90, 35]} intensity={0.3} color="#b9d3ee" />
        </>
      ) : (
        <>
          <Sky
            distance={450000}
            sunPosition={[120, 62, 80]}
            inclination={0.52}
            azimuth={0.23}
            turbidity={7}
            rayleigh={1.7}
            mieCoefficient={0.004}
            mieDirectionalG={0.82}
          />
          <fog attach="fog" args={['#c8e0ee', 210, 460]} />
          <ambientLight intensity={1.25} />
          <hemisphereLight args={['#e7f5ff', '#647453', 1.6]} />
          <directionalLight position={[-50, 110, 45]} intensity={3.1} castShadow />
          <directionalLight position={[60, 72, -55]} intensity={1.4} color="#fff0d6" />
        </>
      )}
      <CricketField stadiumName={stadiumName} teamA={teamA} teamB={teamB} />

      <StadiumTier
        innerRadiusX={49.4}
        innerRadiusZ={37.4}
        outerRadiusX={61}
        outerRadiusZ={46}
        baseHeight={3}
        topHeight={11.8}
        material={lowerTierMaterial}
      />
      <StadiumTier
        innerRadiusX={62.2}
        innerRadiusZ={47}
        outerRadiusX={75}
        outerRadiusZ={56}
        baseHeight={19}
        topHeight={26}
        material={middleTierMaterial}
      />
      <StadiumTier
        innerRadiusX={76.2}
        innerRadiusZ={57}
        outerRadiusX={89}
        outerRadiusZ={66}
        baseHeight={35}
        topHeight={41.5}
        material={upperTierMaterial}
      />
      <StadiumWall radiusX={61.5} radiusZ={46.4} bottom={0} top={isLords ? 14 : 18} color={isLords ? '#9d8060' : '#6f7d80'} />
      <StadiumWall radiusX={76} radiusZ={57} bottom={isLords ? 14.5 : 18.5} top={isLords ? 29 : 34} color={isLords ? '#a38a69' : '#7d8b8d'} />
      <StadiumWall radiusX={90} radiusZ={67} bottom={isLords ? 29.5 : 34.5} top={isLords ? 44 : 51} color={isLords ? '#8e755a' : '#697b80'} />
      <StadiumExterior />

      {(isLords ? [14.8, 29.5] : [18.8, 34.5]).map((height, index) => (
        <EllipseRing
          key={height}
          radiusX={index === 0 ? 61.6 : 76.8}
          radiusZ={index === 0 ? 46.5 : 57.5}
          y={height}
          color={index === 0 ? '#b3c4ce' : '#8da0af'}
          tube={0.42}
        />
      ))}
      {!isLords && <CricketPosters />}
      {!isLords && <EllipseRing radiusX={91} radiusZ={68} y={51.5} color="#aab8c4" tube={0.7} />}

      {!isLords && Array.from({ length: 20 }, (_, index) => {
        const angle = (index / 20) * Math.PI * 2
        const x = Math.cos(angle) * 91
        const z = Math.sin(angle) * 68
        return (
          <group key={index} position={[x, 0, z]}>
            <mesh position={[0, 25.5, 0]} castShadow>
              <boxGeometry args={[0.58, 51, 0.58]} />
              <meshStandardMaterial color="#7d8e9a" metalness={0.42} roughness={0.5} />
            </mesh>
          </group>
        )
      })}

      {!isLords && (
        <>
          <StadiumCanopy />
          <EllipseRing radiusX={90} radiusZ={67} y={54.8} color="#d5e0e6" tube={0.65} />
        </>
      )}
      {isLords && (
        <LordsPavilion />
      )}

      {[
        [-93, -70],
        [93, -70],
        [-93, 70],
        [93, 70],
      ].map(([x, z], index) => (
        <Floodlight key={index} x={x} z={z} nightMode={nightMode} />
      ))}

      {seats.length > 0 && (
        <>
          <SeatInstances
            seats={availableSeats}
            selectedSeatIds={selectedIds}
            hoveredSeatId={hoveredSeatId}
            onSeatClick={onSeatClick}
            onSeatHover={onSeatHover}
          />
          <SeatInstances
            seats={bookedSeats}
            selectedSeatIds={selectedIds}
            hoveredSeatId={hoveredSeatId}
            onSeatClick={onSeatClick}
            onSeatHover={onSeatHover}
          />
          <SeatInstances
            seats={blockedSeats}
            selectedSeatIds={selectedIds}
            hoveredSeatId={hoveredSeatId}
            onSeatClick={onSeatClick}
            onSeatHover={onSeatHover}
          />
        </>
      )}

      {focusedSeat && cameraMode !== 'overview' && (
        <mesh position={[focusedSeat.positionX, focusedSeat.positionY + 1.1, focusedSeat.positionZ]}>
          <ringGeometry args={[0.8, 1.05, 32]} />
          <meshBasicMaterial color="#fff0b2" side={THREE.DoubleSide} />
        </mesh>
      )}

      <OrbitControls
        makeDefault
        enabled={cameraMode !== 'seat'}
        enableDamping
        dampingFactor={0.08}
        minDistance={48}
        maxDistance={190}
        maxPolarAngle={Math.PI * 0.49}
        target={[0, 12, 0]}
      />
      <CameraDirector mode={cameraMode} focusedSeat={focusedSeat} />
    </>
  )
}
