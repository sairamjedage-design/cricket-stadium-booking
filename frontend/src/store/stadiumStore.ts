import { create } from 'zustand'
import { devtools } from 'zustand/middleware'
import type { Vector3 } from 'three'

interface Seat {
  id: string
  sectionId: string
  sectionName: string
  rowNumber: number
  seatNumber: number
  seatLabel: string
  status: 'AVAILABLE' | 'SELECTED' | 'BOOKED' | 'BLOCKED'
  price: number
}

interface Section {
  id: string
  name: string
  tier: string
  category: string
  price: number
}

interface StadiumState {
  selectedMatchId: string | null
  selectedSectionId: string | null
  selectedSeats: Seat[]
  seatAvailability: Record<string, Seat> // seatId -> Seat
  sections: Section[]
  cameraMode: 'overview' | 'section' | 'seat' | 'exterior'
  cameraTarget: Vector3 | null
  setSelectedMatchId: (matchId: string | null) => void
  setSelectedSectionId: (sectionId: string | null) => void
  setSelectedSeats: (seats: Seat[]) => void
  addSelectedSeat: (seat: Seat) => void
  removeSelectedSeat: (seatId: string) => void
  clearSelectedSeats: () => void
  setSeatAvailability: (availability: Record<string, Seat>) => void
  setSections: (sections: Section[]) => void
  setCameraMode: (mode: StadiumState['cameraMode']) => void
  setCameraTarget: (target: Vector3 | null) => void
}

export const useStadiumStore = create<StadiumState>()(
  devtools((set) => ({
    selectedMatchId: null,
    selectedSectionId: null,
    selectedSeats: [],
    seatAvailability: {},
    sections: [],
    cameraMode: 'overview',
    cameraTarget: null,
    setSelectedMatchId: (matchId) => set({ selectedMatchId: matchId }),
    setSelectedSectionId: (sectionId) => set({ selectedSectionId: sectionId }),
    setSelectedSeats: (seats) => set({ selectedSeats: seats }),
    addSelectedSeat: (seat) => set((state) => ({
      selectedSeats: [...state.selectedSeats, seat]
    })),
    removeSelectedSeat: (seatId) => set((state) => ({
      selectedSeats: state.selectedSeats.filter(seat => seat.id !== seatId)
    })),
    clearSelectedSeats: () => set({ selectedSeats: [] }),
    setSeatAvailability: (availability) => set({ seatAvailability: availability }),
    setSections: (sections) => set({ sections }),
    setCameraMode: (mode) => set({ cameraMode: mode }),
    setCameraTarget: (target) => set({ cameraTarget: target })
  }))
)