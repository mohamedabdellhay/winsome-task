"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { getUser } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface Room {
  id: string;
  type: string;
  capacity: number;
  pricePerNight: string;
  availableCount: number;
}

interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  stars: number;
}

export default function BookingPage({ params }: { params: Promise<{ id: string; roomId: string }> }) {
  const { id, roomId } = use(params);
  const router = useRouter();
  
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect hotel managers away from the booking page
  useEffect(() => {
    const user = getUser();
    if (user?.role === "HOTEL_MANAGER") {
      router.replace(`/hotels/${id}`);
    }
  }, [id, router]);

  // Form states
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guestCount, setGuestCount] = useState(1);
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [hotelRes, roomRes] = await Promise.all([
          api.get(`/hotels/${id}`),
          api.get(`/rooms/${roomId}`)
        ]);
        setHotel(hotelRes.data);
        setRoom(roomRes.data);
      } catch (err) {
        console.error("Failed to fetch data:", err);
        setError("Failed to load booking details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, roomId]);

  // Calculate total price whenever dates change
  useEffect(() => {
    if (checkIn && checkOut && room) {
      const start = new Date(checkIn);
      const end = new Date(checkOut);
      if (end > start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        setTotalPrice(diffDays * parseFloat(room.pricePerNight));
      } else {
        setTotalPrice(0);
      }
    }
  }, [checkIn, checkOut, room]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api.post("/bookings", {
        hotelId: id,
        roomId: roomId,
        checkIn,
        checkOut,
        guestCount,
      });
      router.push("/bookings");
    } catch (err: any) {
      console.error("Booking submission error:", err);
      const data = err.response?.data;
      
      let errorMsg = "An unexpected error occurred. Please try again.";
      
      if (data) {
        if (Array.isArray(data.errors) && data.errors.length > 0) {
          errorMsg = data.errors.join(". ");
        } else if (typeof data.message === "string") {
          errorMsg = data.message;
        } else if (Array.isArray(data.message)) {
          errorMsg = data.message[0];
        } else if (data.error) {
          errorMsg = data.error;
        }
      }
      
      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-slate-50">
          <LoadingSpinner />
        </div>
      </>
    );
  }

  if (!hotel || !room) {
    return (
      <>
        <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] bg-slate-50 space-y-4">
          <h2 className="text-2xl font-bold text-slate-700">Error loading booking details</h2>
          <Link href={`/hotels/${id}`} className="text-brand-primary hover:underline">
            ← Back to hotel
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-12">
        <div className="w-full mx-auto px-4">
          <Link href={`/hotels/${id}`} className="inline-flex items-center text-slate-500 hover:text-brand-primary mb-8 transition-colors">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
            Back to {hotel.name}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100">
                <div className="p-8">
                  <h1 className="text-2xl font-bold text-slate-900 mb-6">Confirm your booking</h1>
                  
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Check-in Date</label>
                        <Input
                          type="date"
                          value={checkIn}
                          onChange={(e) => setCheckIn(e.target.value)}
                          required
                          min={new Date().toISOString().split("T")[0]}
                          className="rounded-xl border-slate-200 focus:border-brand-primary focus:ring-brand-primary/20 h-12"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 ml-1">Check-out Date</label>
                        <Input
                          type="date"
                          value={checkOut}
                          onChange={(e) => setCheckOut(e.target.value)}
                          required
                          min={checkIn || new Date().toISOString().split("T")[0]}
                          className="rounded-xl border-slate-200 focus:border-brand-primary focus:ring-brand-primary/20 h-12"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-slate-700 ml-1">Number of Guests</label>
                      <Input
                        type="number"
                        value={guestCount}
                        onChange={(e) => setGuestCount(parseInt(e.target.value))}
                        required
                        min={1}
                        max={room.capacity}
                        className="rounded-xl border-slate-200 focus:border-brand-primary focus:ring-brand-primary/20 h-12"
                      />
                      <p className="text-xs text-slate-400 ml-1">Maximum capacity for this room is {room.capacity} guests.</p>
                    </div>

                    {error && (
                      <div className="p-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl flex items-start gap-3 animate-in shake duration-500">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <p className="text-sm font-bold">Booking Error</p>
                          <p className="text-xs mt-1 opacity-90">{error}</p>
                        </div>
                      </div>
                    )}

                    <Button
                      type="submit"
                      loading={isSubmitting}
                      disabled={!checkIn || !checkOut || totalPrice === 0}
                      className="w-full py-4 rounded-xl text-lg font-bold bg-brand-primary hover:bg-brand-primary/90 text-white transition-all shadow-lg shadow-brand-primary/20"
                    >
                      Complete Booking
                    </Button>
                  </form>
                </div>
              </div>
            </div>

            {/* Room Summary */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/60 overflow-hidden border border-slate-100 sticky top-8">
                <div className="p-6 bg-slate-50 border-b border-slate-100">
                  <h3 className="font-bold text-slate-900">Room Summary</h3>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 capitalize">{room.type} Room</h4>
                    <p className="text-slate-500 text-sm">{hotel.name}</p>
                    <div className="flex text-amber-400 text-xs mt-1">
                      {[...Array(hotel.stars)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between text-slate-600">
                      <span>Price per night</span>
                      <span className="font-semibold text-slate-900">${room.pricePerNight}</span>
                    </div>
                    {totalPrice > 0 && (
                      <div className="flex justify-between text-slate-600">
                        <span>Number of nights</span>
                        <span className="font-semibold text-slate-900">
                          {Math.ceil(Math.abs(new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24))}
                        </span>
                      </div>
                    )}
                  </div>

                  <hr className="border-slate-100" />

                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-slate-900">Total Price</span>
                    <span className="text-3xl font-extrabold text-brand-primary">${totalPrice.toFixed(2)}</span>
                  </div>

                  <div className="bg-emerald-50 p-4 rounded-2xl flex items-start gap-3">
                    <svg className="w-5 h-5 text-emerald-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
                    </svg>
                    <p className="text-xs text-emerald-800 leading-relaxed">
                      Your booking includes complimentary breakfast and high-speed Wi-Fi.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
