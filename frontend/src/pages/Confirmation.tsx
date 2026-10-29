import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useBookingStore, type StoredBooking } from '../store/bookingStore'
import { bookingService } from '../services/bookingService'
import { getApiErrorMessage } from '../services/apiClient'

const Confirmation: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const updateBooking = useBookingStore((state) => state.updateBooking)

  const [booking, setBooking] = useState<StoredBooking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    if (!user || !bookingId || user.id === 'guest') {
      setBooking(null)
      setError('Sign in to view this booking.')
      setLoading(false)
      return () => {
        active = false
      }
    }

    bookingService.getBookingById(bookingId)
      .then((savedBooking) => {
        if (!active) return
        setBooking(savedBooking)
        setError(null)
        updateBooking(savedBooking)
      })
      .catch((requestError: unknown) => {
        if (!active) return
        setBooking(null)
        setError(getApiErrorMessage(requestError, 'This booking could not be found in your account.'))
      })
      .finally(() => {
        if (active) setLoading(false)
      })

    return () => {
      active = false
    }
  }, [bookingId, updateBooking, user])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Booking</h2>
          <p className="text-white">{error || 'Unknown error'}</p>
          <button
            onClick={() => navigate('/matches')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
          >
            Back to Matches
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="mb-6 text-center">
            <svg className={`mx-auto h-14 w-14 ${booking.status === 'CONFIRMED' ? 'text-green-500' : 'text-red-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={booking.status === 'CONFIRMED' ? 'M5 13l4 4L19 7' : 'M6 6l12 12M18 6L6 18'}></path>
            </svg>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">
              {booking.status === 'CONFIRMED' ? 'Booking Confirmed!' : 'Booking Cancelled'}
            </h1>
            <p className="text-gray-600">
              {booking.status === 'CONFIRMED'
                ? 'Your cricket match tickets have been successfully booked.'
                : 'This booking has been cancelled and is kept here for your records.'}
            </p>
          </div>

          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Details</h2>
            <div className="space-y-3">
              <div className="flex">
                <span className="w-1/3 text-gray-600">Booking ID:</span>
                <span className="w-2/3 font-medium">{booking.bookingReference}</span>
              </div>
              <div className="flex">
                <span className="w-1/3 text-gray-600">Match:</span>
                <span className="w-2/3 font-medium">
                  {booking.match.teamA} vs {booking.match.teamB}
                </span>
              </div>
              <div className="flex">
                <span className="w-1/3 text-gray-600">Date:</span>
                <span className="w-2/3 font-medium">
                  {new Date(booking.match.matchDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex">
                <span className="w-1/3 text-gray-600">Venue:</span>
                <span className="w-2/3 font-medium">{booking.match.venue}</span>
              </div>
              <div className="flex">
                <span className="w-1/3 text-gray-600">Seats:</span>
                <span className="w-2/3 font-medium">
                  {booking.seats.map((seat: any, index: number) =>
                    index === 0 ? seat.seatLabel : `, ${seat.seatLabel}`
                  )}
                </span>
              </div>
              <div className="flex">
                <span className="w-1/3 text-gray-600">Section:</span>
                <span className="w-2/3 font-medium">
                  {booking.seats.map((seat: any, index: number) =>
                    index === 0 ? seat.sectionName : `, ${seat.sectionName}`
                  )}
                </span>
              </div>
              <div className="flex">
                <span className="w-1/3 text-gray-600">Price per ticket:</span>
                <span className="w-2/3 font-medium">₹{booking.seats[0]?.price || 0}</span>
              </div>
              <div className="flex">
                <span className="w-1/3 text-gray-600">Quantity:</span>
                <span className="w-2/3 font-medium">{booking.seats.length}</span>
              </div>
              <div className="flex border-t pt-3">
                <span className="w-1/3 text-sm font-medium text-gray-600">Total:</span>
                <span className="w-2/3 text-lg font-bold text-blue-600">₹{booking.totalAmount}</span>
              </div>
            </div>
          </div>

          <div className="mb-8 text-center">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Ticket</h2>
            {booking.status === 'CONFIRMED' ? (
              <div className="mx-auto max-w-sm rounded-xl border border-dashed border-gray-300 bg-gray-50 p-5 text-left">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Booking reference</p>
                    <p className="mt-1 text-lg font-bold tracking-wide text-gray-900">{booking.bookingReference}</p>
                  </div>
                  <div className="grid h-14 w-14 place-items-center rounded-lg bg-emerald-100 text-xl font-black text-emerald-800">
                    ✓
                  </div>
                </div>
                <p className="mt-3 text-xs text-gray-600">
                  Keep this reference for your records. This demo does not issue scannable entry tickets.
                </p>
              </div>
            ) : (
              <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
                This ticket is no longer valid for entry.
              </p>
            )}
          </div>

          <div className="mb-6">
            <button
              onClick={() => {
                // In a real app, this would trigger a download
                alert('Ticket download feature would be implemented here')
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              Download Ticket (PDF)
              <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M5 10l5 5m0-5L5 5"></path>
              </svg>
            </button>
          </div>

          <div className="text-center">
            <button
              onClick={() => navigate('/matches')}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
            >
              Book More Tickets
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg"
            >
              My Bookings
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Confirmation