import { create } from 'zustand';

interface BookingState {
  selectedMatch: {
    id: string;
    teamA: string;
    teamB: string;
    matchDate: string;
    matchTime: string;
    stadium: {
      id: string;
      name: string;
    };
  } | null;
  selectedSeats: string[]; // Array of seat IDs
  seatAvailability: Record<string, boolean>; // seatId -> isAvailable
  bookingSummary: {
    stand: string;
    row: string;
    seats: string[];
    price: number;
    quantity: number;
    total: number;
  } | null;

  // Actions
  setSelectedMatch: (match: BookingState['selectedMatch']) => void;
  toggleSeatSelection: (seatId: string) => void;
  clearSelection: () => void;
  setSeatAvailability: (availability: Record<string, boolean>) => void;
  setBookingSummary: (summary: BookingState['bookingSummary']) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  selectedMatch: null,
  selectedSeats: [],
  seatAvailability: {},
  bookingSummary: null,

  setSelectedMatch: (match) => set({ selectedMatch: match }),

  toggleSeatSelection: (seatId) =>
    set((state) => {
      const isSelected = state.selectedSeats.includes(seatId);
      return {
        selectedSeats: isSelected
          ? state.selectedSeats.filter((id) => id !== seatId)
          : [...state.selectedSeats, seatId],
      };
    }),

  clearSelection: () => set({ selectedSeats: [] }),

  setSeatAvailability: (availability) => set({ seatAvailability: availability }),

  setBookingSummary: (summary) => set({ bookingSummary: summary }),

  resetBooking: () =>
    set({
      selectedMatch: null,
      selectedSeats: [],
      seatAvailability: {},
      bookingSummary: null,
    }),
}));