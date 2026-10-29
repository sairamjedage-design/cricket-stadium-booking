import { useEffect, useState } from 'react'
import { useAuthStore } from '../store/authStore'
import { useNavigate } from 'react-router-dom'

const AdminDashboard: React.FC = () => {
  const { user } = useAuthStore()
  const navigate = useNavigate()

  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/')
      return
    }

    const loadAdminData = async () => {
      try {
        setLoading(true)
        // In a real app, these would be API calls
        // For now, we'll use mock data
        await new Promise(resolve => setTimeout(resolve, 1000))

        const mockStats = {
          totalBookings: 12840,
          totalTicketsSold: 38420,
          totalRevenue: 28400000, // ₹2.84 Cr
          availableSeats: 7320,
          bookingsByStand: [
            { stand: 'North Stand', bookings: 3200 },
            { stand: 'South Stand', bookings: 2980 },
            { stand: 'East Stand', bookings: 3150 },
            { stand: 'West Stand', bookings: 3510 }
          ],
          revenueByMatch: [
            { match: 'India vs Australia', revenue: 8400000 },
            { match: 'India vs England', revenue: 7200000 },
            { match: 'India vs South Africa', revenue: 6800000 }
          ],
          ticketCategorySales: [
            { category: 'General', sales: 15000 },
            { category: 'Premium', sales: 10000 },
            { category: 'VIP', sales: 8000 },
            { category: 'Corporate', sales: 5420 }
          ]
        }

        setStats(mockStats)
        setLoading(false)
      } catch (err) {
        setError('Failed to load admin data')
        setLoading(false)
        console.error(err)
      }
    }

    loadAdminData()
  }, [user, navigate])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Error Loading Admin Dashboard</h2>
          <p className="text-white">{error || 'Unknown error'}</p>
          <button
            onClick={() => navigate('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-500">
                Welcome, {user?.name}! Manage the cricket stadium ticketing system.
              </p>
            </div>
            <div>
              <button
                onClick={() => {
                  // In a real app, this would call logout API
                  navigate('/')
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
              >
                Back to Home
              </button>
            </div>
          </div>

          <div className="grid gap-6 mb-8 md:grid-cols-2 lg:grid-cols-4">
            <div className="bg-blue-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Total Bookings</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalBookings.toLocaleString()}</p>
            </div>

            <div className="bg-green-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Tickets Sold</h3>
              <p className="text-3xl font-bold text-green-600">{stats.totalTicketsSold.toLocaleString()}</p>
            </div>

            <div className="bg-purple-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue</h3>
              <p className="text-3xl font-bold text-purple-600">₹{stats.totalRevenue.toLocaleString()}</p>
            </div>

            <div className="bg-orange-50 rounded-xl p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Available Seats</h3>
              <p className="text-3xl font-bold text-orange-600">{stats.availableSeats.toLocaleString()}</p>
            </div>
          </div>

          <div className="grid gap-6 mb-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Bookings by Stand</h2>
              <div className="space-y-3">
                {stats.bookingsByStand.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded">
                    <span className="font-medium">{item.stand}</span>
                    <span className="text-lg font-semibold">{item.bookings.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Revenue by Match</h2>
              <div className="space-y-3">
                {stats.revenueByMatch.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded">
                    <span className="font-medium">{item.match}</span>
                    <span className="text-lg font-semibold">₹{item.revenue.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-6">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Ticket Category Sales</h2>
              <div className="space-y-3">
                {stats.ticketCategorySales.map((item: any, index: number) => (
                  <div key={index} className="flex justify-between items-center px-4 py-2 bg-gray-50 rounded">
                    <span className="font-medium">{item.category}</span>
                    <span className="text-lg font-semibold">{item.sales.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard