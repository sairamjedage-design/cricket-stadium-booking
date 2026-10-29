import type { StoredBooking } from '../store/bookingStore'
import { apiClient } from './apiClient'

type BookingSeatInput = {
  id: string
  sectionId: string
  sectionName: string
  seatLabel: string
  price: number
}

export const bookingService = {
  createBooking: async (bookingData: {
    matchId: string
    seats: BookingSeatInput[]
  }): Promise<StoredBooking> => {
    const response = await apiClient.post<StoredBooking>('/bookings', bookingData)
    return response.data
  },

  getBookingById: async (bookingId: string): Promise<StoredBooking> => {
    const response = await apiClient.get<StoredBooking>(`/bookings/${bookingId}`)
    return response.data
  },

  getBookings: async (): Promise<StoredBooking[]> => {
    const response = await apiClient.get<StoredBooking[]>('/bookings')
    return response.data
  },

  cancelBooking: async (bookingId: string): Promise<StoredBooking> => {
    const response = await apiClient.post<StoredBooking>(`/bookings/${bookingId}/cancel`)
    return response.data
  },
}