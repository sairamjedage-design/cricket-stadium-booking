import { BrowserRouter } from 'react-router-dom'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './store/authStore'

import Home from './pages/Home'
import Matches from './pages/Matches'
import Stadium from './pages/Stadium'
import Booking from './pages/Booking'
import Confirmation from './pages/Confirmation'
import Login from './pages/Login'
import Register from './pages/Register'
import Profile from './pages/Profile'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const { user, isLoading } = useAuthStore()

  if (isLoading) {
    return <div className="flex h-screen items-center justify-center">Loading...</div>
  }

  const requireAuth = () => !user && <Navigate to="/login" replace />

  return (
    <BrowserRouter>
      <div className="min-h-screen">
        <Routes>
          <Route path="/" element={user ? <Home /> : <Navigate to="/login" replace />} />
          <Route path="/login" element={user ? <Navigate to="/" replace /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" replace /> : <Register />} />
          <Route path="/matches" element={[
            requireAuth(),
            <Matches key="matches" />
          ]} />
          <Route path="/stadium/:matchId" element={[
            requireAuth(),
            <Stadium key="stadium" />
          ]} />
          <Route path="/booking" element={[
            requireAuth(),
            <Booking key="booking" />
          ]} />
          <Route path="/confirmation/:bookingId" element={[
            requireAuth(),
            <Confirmation key="confirmation" />
          ]} />
          <Route path="/profile" element={[
            requireAuth(),
            <Profile key="profile" />
          ]} />
          <Route path="/admin" element={[
            requireAuth(),
            user?.role === 'admin' ? <AdminDashboard /> : <Navigate to="/" replace />
          ]} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App