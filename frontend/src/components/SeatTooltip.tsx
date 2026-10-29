import { useState } from 'react';

interface SeatTooltipProps {
  seat: any;
  isVisible: boolean;
  position: { x: number; y: number };
}

const SeatTooltip = ({
  seat,
  isVisible,
  position,
}: SeatTooltipProps) => {
  if (!isVisible || !seat) {
    return null;
  }

  // Calculate availability text
  let availabilityText = 'Available';
  let availabilityColor = 'text-green-600';

  if (seat.status === 'BOOKED') {
    availabilityText = 'Booked';
    availabilityColor = 'text-red-600';
  } else if (seat.status === 'BLOCKED') {
    availabilityText = 'Blocked';
    availabilityColor = 'text-gray-500';
  }

  return (
    <div
      className="absolute z-50 pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: 'translate(-50%, -100%)',
      }}
    >
      <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-xs w-64">
        <div className="space-y-2">
          <div className="flex justify-between text-sm font-medium">
            <span>Stand:</span>
            <span>{seat.section?.name}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Row:</span>
            <span>Row {seat.rowNumber}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Seat:</span>
            <span>{seat.seatLabel}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Price:</span>
            <span>₹{seat.section?.price}</span>
          </div>
          <div className="flex justify-between text-sm font-medium">
            <span>Status:</span>
            <span className={availabilityColor}>(Availability: {availabilityText})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeatTooltip;