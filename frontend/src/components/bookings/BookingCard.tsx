import React from "react";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

interface BookingCardProps {
  booking: {
    id: string;
    checkIn: string;
    checkOut: string;
    guestCount: number;
    totalPrice: string;
    status: BookingStatus;
    hotel: {
      name: string;
      city: string;
    };
    room: {
      type: string;
    };
  };
  onCancel?: (id: string) => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onCancel }) => {
  const statusColors = {
    PENDING: "bg-amber-100 text-amber-700 border-amber-200",
    CONFIRMED: "bg-emerald-100 text-emerald-700 border-emerald-200",
    CANCELLED: "bg-rose-100 text-rose-700 border-rose-200",
  };

  const checkInDate = new Date(booking.checkIn).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
  
  const checkOutDate = new Date(booking.checkOut).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-slate-900">{booking.hotel.name}</h3>
            <p className="text-slate-500 text-sm flex items-center gap-1">
              <span>📍</span> {booking.hotel.city}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[booking.status]}`}>
            {booking.status}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-50">
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Stay Period</p>
            <p className="text-sm text-slate-700 font-medium">{checkInDate} — {checkOutDate}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Room Details</p>
            <p className="text-sm text-slate-700 font-medium capitalize">{booking.room.type} Room ({booking.guestCount} Guests)</p>
          </div>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <div>
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Total Paid</p>
            <p className="text-xl font-extrabold text-brand-dark">${parseFloat(booking.totalPrice).toFixed(2)}</p>
          </div>
          
          {booking.status === "PENDING" && onCancel && (
            <button
              onClick={() => onCancel(booking.id)}
              className="text-rose-500 hover:text-rose-600 text-sm font-bold hover:underline transition-all"
            >
              Cancel Booking
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
