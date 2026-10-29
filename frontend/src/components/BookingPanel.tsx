import { useState } from 'react';
import { useBookingStore } from '../hooks/useBookingStore';
import { bookingService } from '../services/bookingService';

interface BookingPanelProps {
  match: any;
  stadium: any;
  selectedSeats: string[];
  onViewFromSeat: () => void;
}

const BookingPanel = ({
  match,
  stadium,
  selectedSeats,
  onViewFromSeat,
}: BookingPanelProps) => {
  const {
    bookingSummary,
    resetBooking,
  } = useBookingStore();

  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    email: '',
    phone: '',
  });
  const [isBooking, setIsBooking] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const [bookingSuccess, setBookingSuccess] = useState<boolean>(false);

  // Handle form input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCustomerDetails(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle booking submission
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!customerDetails.name.trim()) {
      setBookingError('Please enter your name');
      return;
    }

    if (!customerDetails.email.trim()) {
      setBookingError('Please enter your email');
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(customerDetails.email)) {
      setBookingError('Please enter a valid email');
      return;
    }

    if (!customerDetails.phone.trim()) {
      setBookingError('Please enter your phone number');
      return;
    }

    if (selectedSeats.length === 0) {
      setBookingError('Please select at least one seat');
      return;
    }

    setIsBooking(true);
    setBookingError(null);

    try {
      // Prepare booking data
      const bookingData = {
        matchId: match.id,
        seats: selectedSeats,
        customer: {
          name: customerDetails.name,
          email: customerDetails.email,
          phone: customerDetails.phone,
        }
      };

      // Create booking
      const response = await bookingService.createBooking(bookingData);

      // Set success state
      setBookingSuccess(true);
      setIsBooking(false);

      // Clear selection after successful booking
      resetBooking();

      // Redirect to confirmation page after a short delay
      setTimeout(() => {
        window.location.href = `/confirmation/${response.booking.id}`;
      }, 1500);

    } catch (error: any) {
      setIsBooking(false);
      setBookingError(
        error.response?.data?.message ||
        'Failed to create booking. Please try again.'
      );
      console.error('Booking error:', error);
    }
  };

  // Handle view from seat
  const handleViewFromSeat = () => {
    onViewFromSeat();
  };

  // Calculate total price
  const totalPrice = bookingSummary
    ? bookingSummary.total
    : selectedSeats.length > 0
      ? selectedSeats.length * 500 // Default price per seat
      : 0;

  return (
    <div className="space-y-6">
      {/* Match Info */}
      <div className="bg-indigo-50 p-4 rounded-lg">
        <h3 className="font-semibold text-indigo-800 mb-2">
          {match.teamA} vs {match.teamB}
        </h3>
        <p className="text-sm text-gray-600">
          {new Date(match.matchDate).toLocaleDateString()} at {match.matchTime}
        </p>
        <p className="text-sm text-gray-600">
          Venue: {stadium.name}
        </p>
      </div>

      {/* Selected Seats Info */}
      {selectedSeats.length > 0 ? (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-3">
            Selected Seats ({selectedSeats.length})
          </h3>
          <div className="space-y-2 text-sm">
            {bookingSummary && (
              <>
                <p className="flex justify-between">
                  <span className="text-gray-600">Stand:</span>
                  <span className="font-medium">{bookingSummary.stand}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Row:</span>
                  <span className="font-medium">{bookingSummary.row}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Seats:</span>
                  <span className="font-medium">{bookingSummary.seats}</span>
                </p>
                <p className="flex justify-between pt-2 border-t">
                  <span className="text-gray-600">Price per seat:</span>
                  <span className="font-medium">₹{bookingSummary.price}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span className="font-medium text-lg">₹{totalPrice}</span>
                </p>
              </>
            )}
          </div>

          {/* View from seat button */}
          {selectedSeats.length === 1 && (
            <button
              onClick={handleViewFromSeat}
              className="mt-3 w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled={isBooking}
            >
              {isBooking ? 'Generating view...' : 'View from Seat'}
            </button>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-gray-500 text-center">
            No seats selected. Click on seats in the stadium to select them.
          </p>
        </div>
      )}

      {/* Customer Details Form */}
      {selectedSeats.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold text-gray-900 mb-4">
            Customer Details
          </h3>
          <form onSubmit={handleBookingSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={customerDetails.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your full name"
                required
                disabled={isBooking}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={customerDetails.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your email"
                required
                disabled={isBooking}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={customerDetails.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                placeholder="Enter your phone number"
                required
                disabled={isBooking}
              />
            </div>

            {bookingError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded-md">
                {bookingError}
              </div>
            )}

            <button
              type="submit"
              className="w-full px-4 py-3 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={isBooking}
            >
              {isBooking ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Processing booking...
                </>
              ) : (
                'Confirm Booking'
              )}
            </button>
          </form>
        </div>
      )}

      {/* Booking Success Message */}
      {bookingSuccess && (
        <div className="bg-green-50 border border-green-400 text-green-800 px-4 py-3 rounded-md">
          <h3 className="font-semibold mb-2">Booking Successful!</h3>
          <p className="text-sm">
            Your booking has been confirmed. You will be redirected to the confirmation page.
          </p>
        </div>
      )}
    </div>
  );
};

export default BookingPanel;