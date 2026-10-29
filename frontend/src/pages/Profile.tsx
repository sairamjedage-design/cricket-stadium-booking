import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { Link, useNavigate } from 'react-router-dom'
import { useBookingStore } from '../store/bookingStore'
import { authService } from '../services/authService'
import { bookingService } from '../services/bookingService'
import { getApiErrorMessage } from '../services/apiClient'

const Profile: React.FC = () => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const bookings = useBookingStore((state) =>
    state.bookings.filter((booking) => booking.userId === user?.id),
  )
  const setBookings = useBookingStore((state) => state.setBookings)
  const updateBooking = useBookingStore((state) => state.updateBooking)
  const [bookingFilter, setBookingFilter] = useState<'ALL' | 'CONFIRMED' | 'CANCELLED'>('ALL')

  const [userData, setUserData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({})
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [bookingActionError, setBookingActionError] = useState<string | null>(null)
  const visibleBookings = bookings.filter(
    (booking) => bookingFilter === 'ALL' || booking.status === bookingFilter,
  )

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true)
        const [profile, accountBookings] = await Promise.all([
          authService.getProfile(),
          bookingService.getBookings(),
        ])
        setUserData(profile.user)
        setBookings(accountBookings)
        setLoading(false)
      } catch (err) {
        setError(getApiErrorMessage(err, 'Failed to load profile data'))
        setLoading(false)
      }
    }
    if (user) {
      loadProfileData()
    } else {
      navigate('/login')
    }
  }, [user, logout, setBookings])

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const updatedBooking = await bookingService.cancelBooking(bookingId)
      updateBooking(updatedBooking)
      setBookingActionError(null)
    } catch (err) {
      setBookingActionError(getApiErrorMessage(err, 'Failed to cancel booking. Please try again.'))
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordErrors({})
    setPasswordSuccess(false)

    // Simple validation
    if (!passwordForm.currentPassword) {
      setPasswordErrors({ currentPassword: 'Current password is required' })
      return
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 8) {
      setPasswordErrors({ newPassword: 'New password must be at least 8 characters' })
      return
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordErrors({ confirmPassword: 'Passwords do not match' })
      return
    }

    try {
      await authService.updatePassword(passwordForm.currentPassword, passwordForm.newPassword)
      setPasswordSuccess(true)
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      })
    } catch (err) {
      setPasswordErrors({ submit: getApiErrorMessage(err, 'Failed to update password. Please try again.') })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-lg text-gray-600">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Profile</h2>
          <p className="text-white">{error || 'Unknown error'}</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105"
          >
            Back to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
              <p className="text-sm text-gray-500">
                Manage your account and booking history
              </p>
            </div>
            <div>
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105"
              >
                Logout
              </button>
            </div>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {/* Profile Header */}
            <div className="col-span-3">
              <div className="flex items-center space-x-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                <div className="relative grid h-16 w-16 place-items-center">
                  {userData.photoDataUrl ? (
                    <img
                      src={userData.photoDataUrl}
                      alt={`${userData.name}'s profile`}
                      className="h-16 w-16 rounded-full border-4 border-white object-cover shadow-lg"
                    />
                  ) : (
                    <div
                      aria-label={`${userData.name}'s initials`}
                      className="grid h-16 w-16 place-items-center rounded-full border-4 border-white bg-emerald-100 text-xl font-bold text-emerald-800 shadow-lg"
                    >
                      {userData.name
                        .split(/\s+/)
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((part: string) => part[0]?.toUpperCase())
                        .join('')}
                    </div>
                  )}
                  <div className="absolute bottom-0 right-0 h-4 w-4 bg-green-500 rounded-full border-2 border-white">
                    {/* Online indicator */}
                  </div>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{userData.name}</h2>
                  <p className="text-lg text-gray-600">{userData.email}</p>
                  <div className="mt-2 flex items-center space-x-3">
                    <span className="px-3 py-1 text-sm font-medium {
                      userData.role === 'admin'
                        ? 'bg-blue-100 text-blue-800 rounded-full'
                        : 'bg-green-100 text-green-800 rounded-full'
                    }">
                      {userData.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                    <span className="h-3 w-3 bg-green-500 rounded-full">{/* Online status */}</span>
                    <span className="text-sm text-green-600">Online</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="col-span-3">
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Account Information</h2>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Contact Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-gray-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"></path>
                        </svg>
                        <span><strong>Full Name:</strong> {userData.name}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"></path>
                        </svg>
                        <span><strong>Email:</strong> {userData.email}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 17V10zM9 8a1 1 0 001 1v1h3a1 1 0 011 1v3a1 1 0 01-1 1H9a1 1 0 00-1-1V9a1 1 0 001-1z"></path>
                        </svg>
                        <span><strong>Phone:</strong> {userData.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Account Details</h3>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 text-gray-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H3m5 7V4m-2 2h10"></path>
                        </svg>
                        <span><strong>Member Since:</strong>
                          {new Date(userData.createdAt ?? new Date().toISOString()).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center space-x-3 text-gray-600">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-.155-.006-.31-.018-.463z"></path>
                        </svg>
                        <span><strong>Role:</strong> {userData.role}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Change Password */}
            <div className="col-span-3">
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900">Change Password</h2>
                {passwordSuccess && (
                  <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                    <div className="flex items-center space-x-2">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                      </svg>
                      <span className="text-green-700">Password updated successfully!</span>
                    </div>
                  </div>
                )}
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Current Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={passwordForm.currentPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                        placeholder="Enter your current password"
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                          passwordErrors.currentPassword ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {passwordErrors.currentPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.currentPassword}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        placeholder="Enter your new password"
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                          passwordErrors.newPassword ? 'border-red-500' : ''
                        }`}
                        required
                        minLength={8}
                      />
                      {passwordErrors.newPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.newPassword}</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        placeholder="Confirm your new password"
                        className={`w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                          passwordErrors.confirmPassword ? 'border-red-500' : ''
                        }`}
                        required
                      />
                      {passwordErrors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                      )}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordSuccess}
                    className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50 ${
                      passwordSuccess ? 'bg-gray-400' : ''
                    }`}
                  >
                    {passwordSuccess ? 'Updated!' : 'Update Password'}
                  </button>
                </form>
              </div>
            </div>

            {/* Booking History */}
            <div className="col-span-3">
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
                    <p className="mt-1 text-sm text-gray-500">View confirmations and manage cancelled tickets.</p>
                  </div>
                  <div className="flex rounded-lg bg-gray-100 p-1">
                    {(['ALL', 'CONFIRMED', 'CANCELLED'] as const).map((filter) => (
                      <button
                        key={filter}
                        type="button"
                        onClick={() => setBookingFilter(filter)}
                        aria-pressed={bookingFilter === filter}
                        className={`rounded-md px-3 py-2 text-xs font-semibold transition ${
                          bookingFilter === filter
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-500 hover:text-gray-800'
                        }`}
                      >
                        {filter === 'ALL' ? `All (${bookings.length})` : `${filter} (${bookings.filter((booking) => booking.status === filter).length})`}
                      </button>
                    ))}
                  </div>
                </div>
                {bookingActionError && (
                  <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {bookingActionError}
                  </p>
                )}
                {visibleBookings.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-500">
                      {bookingFilter === 'ALL'
                        ? "You haven't made any bookings yet."
                        : `You don't have any ${bookingFilter.toLowerCase()} bookings.`}
                    </p>
                    <Link
                      to="/matches"
                      className="mt-4 inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700"
                    >
                      Explore Matches
                      <svg className="ml-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visibleBookings.map((booking) => (
                      <div
                        key={booking.id}
                        className={`rounded-xl border p-6 transition-shadow hover:shadow-lg ${
                          booking.status === 'CANCELLED' ? 'border-red-200 bg-red-50/40' : 'border-gray-200 bg-white'
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">
                              {booking.match.teamA} vs {booking.match.teamB}
                            </h3>
                            <p className="text-sm text-gray-500 flex items-center space-x-2">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M12 8v4l3 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                              </svg>
                              {new Date(booking.match.matchDate).toLocaleDateString('en-US', {
                                weekday: 'short',
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric'
                              })} · {booking.match.localTime} {booking.match.timeZone}
                            </p>
                            <p className="text-sm text-gray-500">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" strokeWidth="2"></circle>
                                <path d="M12 12L12 8" strokeWidth="2" strokeLinecap="round"></path>
                                <path d="M12 12L8 12" strokeWidth="2" strokeLinecap="round"></path>
                              </svg>
                              {booking.match.venue}
                            </p>
                          </div>
                          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {booking.status}
                          </span>
                        </div>

                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 text-gray-600">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h18"></path>
                            </svg>
                            <span><strong>Booking ID:</strong> {booking.bookingReference}</span>
                          </div>

                          <div className="flex items-center space-x-3 text-gray-600">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M2 12l3-3v6l3-3"></path>
                            </svg>
                            <span><strong>Seats:</strong>
                              {booking.seats.map((seat: any, i: number) =>
                                i === 0 ? seat.seatLabel : `, ${seat.seatLabel}`
                              )}
                            </span>
                          </div>

                          <div className="flex items-center space-x-3 text-gray-600">
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                            </svg>
                            <span><strong>Sections:</strong>
                              {booking.seats.map((seat: any, i: number) =>
                                i === 0 ? seat.sectionName : `, ${seat.sectionName}`
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex border-t pt-4">
                          <span className="w-1/2 text-sm font-medium text-gray-600">Total Amount:</span>
                          <span className="w-1/2 text-2xl font-bold text-blue-600 text-right">₹{booking.totalAmount}</span>
                        </div>

                        <div className="mt-4">
                          <div className="flex flex-wrap gap-3">
                            {booking.status === 'CONFIRMED' && (
                              <button
                                type="button"
                                onClick={() => navigate(`/confirmation/${booking.id}`)}
                                className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                              >
                                View confirmation
                              </button>
                            )}
                            {booking.status === 'CONFIRMED' && (
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm(`Cancel booking ${booking.bookingReference}?`)) {
                                    void handleCancelBooking(booking.id)
                                  }
                                }}
                                className="rounded-lg border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-50"
                              >
                                Cancel booking
                              </button>
                            )}
                            {booking.status === 'CANCELLED' && (
                              <p className="text-sm text-red-700">
                                Cancelled {booking.cancelledAt ? new Date(booking.cancelledAt).toLocaleString() : ''}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 backdrop-blur-sm">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="logout-confirm-title"
            aria-describedby="logout-confirm-description"
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <h2 id="logout-confirm-title" className="text-xl font-bold text-gray-900">
              Log out of your account?
            </h2>
            <p id="logout-confirm-description" className="mt-2 text-sm leading-6 text-gray-600">
              Are you sure you want to log out? You’ll need to sign in again to access your account.
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutConfirm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  logout()
                  navigate('/login')
                }}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-red-700"
              >
                Yes, log out
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}

export default Profile