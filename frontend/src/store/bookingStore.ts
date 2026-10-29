import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type BookingStatus = 'CONFIRMED' | 'CANCELLED'

export type BookingSeat = {
  seatId: string
  seatLabel: string
  sectionId: string
  sectionName: string
  price: number
}

export type StoredBooking = {
  id: string
  bookingReference: string
  userId: string
  matchId: string
  match: {
    teamA: string
    teamB: string
    matchDate: string
    localTime: string
    timeZone: string
    venue: string
    city: string
    country: string
    format: string
  }
  seats: BookingSeat[]
  totalAmount: number
  status: BookingStatus
  createdAt: string
  cancelledAt?: string
}

type BookingState = {
  bookings: StoredBooking[]
  addBooking: (booking: StoredBooking) => void
  setBookings: (bookings: StoredBooking[]) => void
  updateBooking: (booking: StoredBooking) => void
  cancelBooking: (bookingId: string, userId: string) => void
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      bookings: [],
      addBooking: (booking) =>
        set((state) => ({ bookings: [booking, ...state.bookings] })),
      setBookings: (bookings) => set({ bookings }),
      updateBooking: (booking) =>
        set((state) => ({
          bookings: [booking, ...state.bookings.filter((item) => item.id !== booking.id)],
        })),
      cancelBooking: (bookingId, userId) =>
        set((state) => ({
          bookings: state.bookings.map((booking) =>
            booking.id === bookingId &&
            booking.userId === userId &&
            booking.status === 'CONFIRMED'
              ? { ...booking, status: 'CANCELLED', cancelledAt: new Date().toISOString() }
              : booking,
          ),
        })),
    }),
    { name: 'cricketverse-bookings' },
  ),
)
