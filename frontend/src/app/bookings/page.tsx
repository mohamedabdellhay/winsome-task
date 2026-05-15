"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { UserLayout } from "@/components/layouts/UserLayout";
import { BookingCard } from "@/components/bookings/BookingCard";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { isAdmin as checkIsAdmin } from "@/lib/auth";
import { useToast } from "@/components/ui/Toast";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { BookingStatus } from "@/types/booking";

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { showToast } = useToast();

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<{ id: string, status: BookingStatus } | null>(null);

  const fetchBookings = async () => {
    try {
      const response = await api.get("/bookings");
      setBookings(response.data.data ?? response.data);
    } catch (err) {
      console.error("Failed to fetch bookings:", err);
      setError("Failed to load bookings. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setIsAdmin(checkIsAdmin());
    fetchBookings();
  }, []);

  const handleStatusUpdate = (id: string, status: BookingStatus) => {
    setSelectedBooking({ id, status });
    setModalOpen(true);
  };

  const confirmStatusUpdate = async () => {
    if (!selectedBooking) return;
    const { id, status } = selectedBooking;
    const action = status === BookingStatus.CONFIRMED ? "confirmed" : "cancelled";

    try {
      await api.patch(`/bookings/${id}/status`, { status });
      setBookings(bookings.map(b => b.id === id ? { ...b, status } : b));
      showToast(`Booking successfully ${action}!`, "success");
    } catch (err: any) {
      console.error(`Failed to update booking:`, err);
      const data = err.response?.data;
      let errorMsg = `Failed to ${action} booking.`;
      
      if (data) {
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          errorMsg = data.errors.join(". ");
        } else if (typeof data.message === "string") {
          errorMsg = data.message;
        } else if (Array.isArray(data.message)) {
          errorMsg = data.message[0];
        }
      }
      
      showToast(errorMsg, "error");
    } finally {
      setModalOpen(false);
      setSelectedBooking(null);
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
                <svg className="w-10 h-10 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
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
                  onStatusUpdate={handleStatusUpdate}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <ConfirmModal 
        isOpen={modalOpen}
        title={selectedBooking?.status === BookingStatus.CONFIRMED ? "Confirm Booking" : "Cancel Booking"}
        message={`Are you sure you want to ${selectedBooking?.status === BookingStatus.CONFIRMED ? "confirm" : "cancel"} this booking? This action cannot be undone.`}
        confirmLabel={selectedBooking?.status === BookingStatus.CONFIRMED ? "Confirm" : "Cancel Booking"}
        cancelLabel="No, Go Back"
        onConfirm={confirmStatusUpdate}
        onCancel={() => setModalOpen(false)}
        variant={selectedBooking?.status === BookingStatus.CONFIRMED ? "success" : "danger"}
      />
    </UserLayout>
  );
}
