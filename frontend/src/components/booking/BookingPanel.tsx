import { Link, useNavigate } from 'react-router-dom'
import { useStadiumStore } from '../../store/stadiumStore'

interface BookingPanelProps {
  selectedSeats: any[]
  onConfirmBooking: () => void
}

const BookingPanel: React.FC<BookingPanelProps> = ({ selectedSeats, onConfirmBooking }) => {
  const navigate = useNavigate()
  const { selectedSeats: storeSelectedSeats } = useStadiumStore()

  // Use store selected seats if prop is not provided (for consistency)
  const seatsToDisplay = selectedSeats.length > 0 ? selectedSeats : storeSelectedSeats

  const totalPrice = seatsToDisplay.reduce((sum: number, seat: any) => sum + seat.price, 0)

  const handleConfirmBooking = () => {
    if (seatsToDisplay.length === 0) {
      alert('Please select at least one seat')
      return
    }
    navigate('/booking')
  }

  return (
    <div className="p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-gray-900">Booking Summary</h2>
      </div>

      {seatsToDisplay.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">Select seats to see your booking summary here</p>
        </div>
      ) : (
        <>
          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Selected Seats</h3>
            <div className="space-y-2">
              {seatsToDisplay.map((seat: any, index: number) => (
                <div key={index} className="flex justify-between items-center bg-gray-50 p-3 rounded">
                  <div>
                    <span className="font-medium">{seat.seatLabel}</span>
                    <span className="ml-2 text-xs text-gray-500">({seat.sectionId})</span>
                  </div>
                  <span className="text-sm font-medium">₹{seat.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <h3 className="text-lg font-medium text-gray-700 mb-2">Price Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Price per ticket:</span>
                <span className="text-sm font-medium">₹{seatsToDisplay[0]?.price || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Quantity:</span>
                <span className="text-sm font-medium">{seatsToDisplay.length}</span>
              </div>
              <div className="flex justify-between border-t pt-2">
                <span className="text-sm font-medium text-gray-600">Total:</span>
                <span className="text-xl font-bold text-blue-600">₹{totalPrice}</span>
              </div>
            </div>
          </div>

          <button
            onClick={handleConfirmBooking}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-transform transform hover:scale-105 disabled:opacity-50"
          >
            Continue to Booking
          </button>
        </>
      )}
    </div>
  )
}

export default BookingPanel