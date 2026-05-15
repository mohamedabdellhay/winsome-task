"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { UserLayout } from "@/components/layouts/UserLayout";
import { BookingCard } from "@/components/bookings/BookingCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

export enum BookingStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  CANCELLED = "CANCELLED",
}

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings");
      setBookings(response.data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load your bookings. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      await api.patch(`/bookings/${id}/status`, { status: BookingStatus.CANCELLED });
      // Update local state
      setBookings(bookings.map(b => b.id === id ? { ...b, status: BookingStatus.CANCELLED } : b));
    } catch (err) {
      console.error("Failed to cancel booking:", err);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  if (isLoading) {
    return (
      <UserLayout>
        <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-slate-50">
          <LoadingSpinner />
        </div>
      </UserLayout>
    );
  }

  return (
    <UserLayout>
      <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-12">
        <div className="w-full mx-auto px-4">
          <div className="flex justify-between items-center mb-10">
            <div>
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Bookings</h1>
              <p className="text-slate-500 mt-1">Manage your upcoming stays and history</p>
            </div>
            <Link 
              href="/hotels" 
              className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20"
            >
              Book New Trip
            </Link>
          </div>

          {error && (
            <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-xl text-sm font-medium mb-8">
              {error}
            </div>
          )}

          {bookings.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center shadow-xl shadow-slate-200/40">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-4xl text-slate-300">🧳</span>
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">No bookings found</h3>
              <p className="text-slate-500 mb-8 max-w-sm mx-auto">
                You haven't made any bookings yet. Explore our selection of premium hotels to start your journey.
              </p>
              <Link 
                href="/hotels" 
                className="text-brand-primary font-bold hover:underline"
              >
                Browse Hotels →
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {bookings.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((booking) => (
                <BookingCard 
                  key={booking.id} 
                  booking={booking} 
                  onCancel={handleCancel}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
