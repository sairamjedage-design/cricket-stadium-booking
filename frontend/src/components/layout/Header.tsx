import { Link } from 'react-router-dom';
import { useAuthStore } from '../../hooks/useAuthStore';
import { logOut } from '../../services/authService';

export const Header = () => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return <div className="h-16 w-full">Loading...</div>;
  }

  return (
    <header className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <span className="text-xl font-bold text-indigo-600">
                Cricket Stadium Booking
              </span>
            </Link>
          </div>
          <div className="hidden md:flex md:items-center md:space-x-4">
            {!user ? (
              <>
                <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
                  Login
                </Link>
                <Link to="/register" className="ml-4 text-indigo-600 hover:text-indigo-500">
                  Register
                </Link>
              </>
            ) : (
              <>
                <Link to="/" className="text-indigo-600 hover:text-indigo-500">
                  Home
                </Link>
                <Link
                  to="/stadium/1"
                  className="ml-4 text-indigo-600 hover:text-indigo-500"
                >
                  Book Tickets
                </Link>
                <Link
                  to="/admin"
                  className="ml-4 text-indigo-600 hover:text-indigo-500"
                >
                  Admin
                </Link>
                <button
                  onClick={handleLogout}
                  className="ml-4 text-indigo-600 hover:text-indigo-500"
                >
                  Logout ({user?.name})
                </button>
              </>
            )}
          </div>
          <div className="flex items-center md:hidden">
            {/* Mobile menu button would go here */}
            <Link to="/login" className="text-indigo-600 hover:text-indigo-500">
              Login
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

const handleLogout = async () => {
  await logOut();
  // Redirect to login page
  window.location.href = '/login';
};