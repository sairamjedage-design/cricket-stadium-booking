import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { useStadiumStore } from '../store/stadiumStore'
import { useBookingStore, type StoredBooking } from '../store/bookingStore'
import { demoMatches } from '../services/demoMatches'
import { bookingService } from '../services/bookingService'
import { getApiErrorMessage } from '../services/apiClient'

const Booking: React.FC = () => {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { selectedSeats, selectedMatchId, clearSelectedSeats } = useStadiumStore()
  const addBooking = useBookingStore((state) => state.addBooking)
  const match = demoMatches.find((fixture) => fixture.id === selectedMatchId) ?? demoMatches[0]

  const [formData, setFormData] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: ''
  })

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [bookingData, setBookingData] = useState<StoredBooking | null>(null)

  useEffect(() => {
    // Pre-fill form with user data if available
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.name,
        email: user.email
      }))
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (selectedSeats.length === 0) {
      setError('Please select seats first')
      return
    }
    if (!user || user.id === 'guest') {
      setError('Sign in or create an account before placing a booking.')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const savedBooking = await bookingService.createBooking({
        matchId: match.id,
        seats: selectedSeats,
      })

      addBooking(savedBooking)
      setBookingData(savedBooking)
      setSuccess(true)
      setLoading(false)
      clearSelectedSeats()
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to create booking. Please try again.'))
      setLoading(false)
      console.error(err)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Processing booking...</p>
        </div>
      </div>
    )
  }

  if (success && bookingData) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="mb-6">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Confirmed!</h1>
            <p className="text-gray-600 mb-6">Your cricket match tickets have been successfully booked.</p>

            <div className="text-left mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Booking Details</h2>
              <div className="space-y-3">
                <div className="flex">
                  <span className="w-1/3 text-gray-600">Booking ID:</span>
                  <span className="w-2/3 font-medium">{bookingData.bookingReference}</span>
                </div>
                <div className="flex">
                  <span className="w-1/3 text-gray-600">Match:</span>
                  <span className="w-2/3 font-medium">{bookingData.match.teamA} vs {bookingData.match.teamB}</span>
                </div>
                <div className="flex">
                  <span className="w-1/3 text-gray-600">Date:</span>
                  <span className="w-2/3 font-medium">{new Date(bookingData.createdAt).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</span>
                </div>
                <div className="flex">
                  <span className="w-1/3 text-gray-600">Seats:</span>
                  <span className="w-2/3 font-medium">
                    {bookingData.seats.map((seat: any, index: number) =>
                      index === 0 ? seat.seatLabel : `, ${seat.seatLabel}`
                    )}
                  </span>
                </div>
                <div className="flex">
                  <span className="w-1/3 text-gray-600">Total:</span>
                  <span className="w-2/3 font-medium text-xl">₹{bookingData.totalAmount}</span>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={() => navigate(`/confirmation/${bookingData.id}`)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105"
              >
                View Booking Confirmation
              </button>
              <button
                onClick={() => navigate('/matches')}
                className="ml-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-3 px-6 rounded-lg"
              >
                Book More Tickets
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Enter Booking Details</h1>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 text-red-600 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
              />
            </div>

            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-700 mb-2">Booking Summary</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Match:</span>
                  <span className="text-sm font-medium">{match.teamA} vs {match.teamB}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Selected Seats:</span>
                  <span className="text-sm font-medium">
                    {selectedSeats.map((seat: any, index: number) =>
                      index === 0 ? seat.seatLabel : `, ${seat.seatLabel}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between border-t pt-3">
                  <span className="text-sm font-medium text-gray-600">Total Amount:</span>
                  <span className="text-lg font-bold text-blue-600">₹{selectedSeats.reduce((sum: number, seat: any) => sum + seat.price, 0)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm Booking'}
            </button>
          </form>
        </div>
      </div>
    </div>
    )
}

export default Booking