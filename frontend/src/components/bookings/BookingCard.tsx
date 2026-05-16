import React from "react";
import { BookingStatus } from "@/types/booking";

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
    user?: {
      name: string;
      email: string;
    };
  };
  onStatusUpdate?: (id: string, status: BookingStatus) => void;
  isStaff?: boolean;
}

export const BookingCard: React.FC<BookingCardProps> = ({ booking, onStatusUpdate, isStaff }) => {
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
              <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {booking.hotel.city}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold border ${statusColors[booking.status]}`}>
            {booking.status}
          </span>
        </div>

        {isStaff && booking.user && (
          <div className="mb-4 p-3 bg-slate-50 rounded-xl border border-slate-100">
            <p className="text-xs text-slate-400 uppercase font-bold tracking-wider mb-1">Booked By</p>
            <p className="text-sm font-semibold text-slate-700">{booking.user.name} ({booking.user.email})</p>
          </div>
        )}

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
          
          <div className="flex gap-4">
            {booking.status === "PENDING" && onStatusUpdate && (
              <>
                {isStaff && (
                  <button
                    onClick={() => onStatusUpdate(booking.id, BookingStatus.CONFIRMED)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    Confirm Booking
                  </button>
                )}
                <button
                  onClick={() => onStatusUpdate(booking.id, BookingStatus.CANCELLED)}
                  className="text-rose-500 hover:text-rose-600 text-sm font-bold hover:underline transition-all"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
