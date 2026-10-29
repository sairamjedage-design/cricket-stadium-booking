import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'

const Home: React.FC = () => {
  const { user, isLoading } = useAuthStore()

  useEffect(() => {
    // Any initialization logic can go here
  }, [])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Loading application...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            3D Cricket Stadium Ticket Booking
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Experience the future of cricket ticket booking with immersive 3D stadium visualization
          </p>
          <div className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-transform transform hover:scale-105">
            <Link to="/matches" className="flex items-center space-x-2">
              <span>Explore Live Matches</span>
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
              </svg>
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Interactive 3D Stadium */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow hover:-translate-y-1 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-blue-50 h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v10a2 2 0 002 2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Interactive 3D Stadium</h3>
                <p className="text-sm text-gray-500">
                  Explore cricket stadiums in stunning 3D with realistic seat selection and viewing angles
                </p>
              </div>
            </div>
          </div>

          {/* Real-time Availability */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow hover:-translate-y-1 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-green-50 h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-.155-.006-.31-.018-.463z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Real-time Availability</h3>
                <p className="text-sm text-gray-500">
                  See live seat availability and pricing with intuitive color-coded visualization
                </p>
              </div>
            </div>
          </div>

          {/* View From Seat */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow hover:-translate-y-1 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-purple-50 h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">View From Seat</h3>
                <p className="text-sm text-gray-500">
                  Experience the exact view from your selected seat before booking
                </p>
              </div>
            </div>
          </div>

          {/* Secure Booking */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow hover:-translate-y-1 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-indigo-50 h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Secure Booking</h3>
                <p className="text-sm text-gray-500">
                  Safe and secure payment processing with instant booking confirmation
                </p>
              </div>
            </div>
          </div>

          {/* Mobile Friendly */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow hover:-translate-y-1 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-pink-50 h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h3m8 0h3M8 12h.01M8 16h3.01M8 20h3.01M12 11a3 3 0 100-6 3 3 0 000 6zM12 16a3 3 0 100-6 3 3 0 000 6z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Mobile Friendly</h3>
                <p className="text-sm text-gray-500">
                  Fully responsive design that works seamlessly on mobile and tablet devices
                </p>
              </div>
            </div>
          </div>

          {/* QR Ticket Delivery */}
          <div className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow hover:-translate-y-1 overflow-hidden">
            <div className="p-6">
              <div className="flex items-center mb-4">
                <div className="bg-amber-50 h-12 w-12 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3-.895 3-2-1.343-2-3-2z"></path>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">QR Ticket Delivery</h3>
                <p className="text-sm text-gray-500">
                  Receive instant digital tickets with QR codes for easy stadium entry
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="mt-16 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to experience cricket like never before?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Book your tickets now and enjoy the best seats in the house with our immersive 3D stadium viewer
          </p>
          <Link
            to="/matches"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105 flex items-center justify-center space-x-3"
          >
            <span>Explore Upcoming Matches</span>
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
            </svg>
          </Link>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
          <p>&copy; {new Date().getFullYear()} Cricket Stadium Booking. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}

export default Home