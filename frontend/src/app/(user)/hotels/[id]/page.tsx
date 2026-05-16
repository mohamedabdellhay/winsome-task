"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { isStaff as checkIsStaff } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

interface Room {
  id: string;
  type: string;
  capacity: number;
  pricePerNight: string; // Decimal comes as string from API usually
  availableCount: number;
}

interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  stars: number;
  rooms: Room[];
}

export default function HotelDetailsPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;
  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStaff, setIsStaff] = useState(false);
  const [error, setError] = useState<any>(null);
  const [hotelNotFound, setHotelNotFound] = useState(false);

  useEffect(() => {
    setIsStaff(checkIsStaff());
  }, []);

  useEffect(() => {
    const fetchHotel = async () => {
      try {
        const response = await api.get(`/hotels/${id}`);
        setHotel(response.data);
      } catch (err: any) {
        console.error("Failed to fetch hotel details:", err);
        if (err.response?.status === 404) {
          setHotelNotFound(true);
        } else {
          setError(err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotel();
  }, [id]);

  if (error) {
    throw error;
  }

  if (hotelNotFound) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] bg-slate-50 p-6">
        <div className="max-w-xl w-full rounded-3xl bg-white border border-slate-200 p-10 text-center shadow-xl">
          <h2 className="text-3xl font-bold text-slate-900 mb-3">
            Hotel not found
          </h2>
          <p className="text-slate-500 mb-8">
            The hotel you're looking for does not exist or is unavailable.
          </p>
          <Link
            href="/hotels"
            className="inline-flex items-center justify-center rounded-full bg-brand-primary px-6 py-3 text-white font-semibold hover:bg-brand-primary/90 transition-colors"
          >
            Browse Hotels
          </Link>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        <div className="flex justify-center items-center h-[calc(100vh-64px)] bg-slate-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
        </div>
      </>
    );
  }

  if (!hotel) {
    return (
      <div className="flex flex-col justify-center items-center h-[calc(100vh-64px)] bg-[var(--bg-main)] p-6">
        <div className="glass-card max-w-lg w-full p-12 text-center rounded-2xl shadow-xl animate-zoom-in">
          <div className="w-20 h-20 bg-brand-primary/10 rounded-full mx-auto flex items-center justify-center mb-6">
            <svg
              className="w-10 h-10 text-brand-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-brand-dark mb-4">
            Hotel Not Found
          </h2>
          <p className="text-slate-600 mb-8 leading-relaxed">
            The hotel you are looking for might have been removed or the ID is
            incorrect. We invite you to explore our other premium properties.
          </p>
          <Link href="/hotels" passHref>
            <Button variant="primary" className="w-full py-4 text-lg">
              Explore Other Hotels
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-50 min-h-[calc(100vh-64px)] pb-20">
        {/* Hero Section */}
        <div className="relative h-96 bg-slate-800 text-white overflow-hidden">
          {/* Placeholder for actual image */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"></div>
          <div className="absolute bottom-0 left-0 w-full z-20 px-4 sm:px-6 lg:px-8 pb-12 pt-32 max-w-7xl mx-auto">
            <Link
              href="/hotels"
              className="inline-block text-slate-300 hover:text-white mb-6 text-sm transition-colors"
            >
              ← Back to Hotels
            </Link>
            <div className="flex items-center gap-4 mb-2">
              <span className="bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                Premium
              </span>
              <div className="flex text-amber-400">
                {[...Array(hotel.stars)].map((_, i) => (
                  <span key={i}>★</span>
                ))}
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">
              {hotel.name}
            </h1>
            <p className="mt-4 text-lg text-slate-300 flex items-center gap-2">
              <svg
                className="w-5 h-5 text-brand-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {hotel.address}, {hotel.city}
            </p>
          </div>
        </div>

        {/* Content Section */}
        <div className="w-full mx-auto px-1 sm:px-6 lg:px-8 mt-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column - Details */}
            <div className="lg:col-span-2 space-y-10">
              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-4">
                  About this hotel
                </h2>
                <p className="text-slate-600 leading-relaxed text-lg">
                  Experience the pinnacle of luxury and comfort at {hotel.name}.
                  Perfectly situated in the heart of {hotel.city}, our hotel
                  offers unparalleled service, breathtaking views, and
                  world-class amenities. Whether you're traveling for business
                  or leisure, our dedicated team is committed to making your
                  stay unforgettable.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-slate-900 mb-6">
                  Available Rooms
                </h2>
                {hotel.rooms.length === 0 ? (
                  <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center">
                    <p className="text-slate-500">
                      No rooms are currently available for this hotel.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {hotel.rooms.map((room) => (
                      <div
                        key={room.id}
                        className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6 hover:border-brand-primary/50 transition-colors"
                      >
                        <div className="flex-1 w-full">
                          <h3 className="text-xl font-bold text-slate-900 capitalize">
                            {room.type} Room
                          </h3>
                          <div className="flex flex-wrap gap-4 mt-3 text-sm text-slate-600">
                            <span className="flex items-center gap-1">
                              <svg
                                className="w-5 h-5 text-slate-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                ></path>
                              </svg>
                              Up to {room.capacity} Guests
                            </span>
                            <span className="flex items-center gap-1 text-emerald-600 font-medium">
                              <svg
                                className="w-5 h-5"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                ></path>
                              </svg>
                              {room.availableCount} Available
                            </span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end w-full md:w-auto">
                          <div className="text-right mb-4">
                            <span className="text-2xl font-bold text-brand-dark">
                              ${room.pricePerNight}
                            </span>
                            <span className="text-slate-500 text-sm">
                              {" "}
                              / night
                            </span>
                          </div>
                          {room.availableCount > 0 ? (
                            !isStaff ? (
                              <Link
                                href={`/hotels/${hotel.id}/book/${room.id}`}
                                className="w-full md:w-auto bg-brand-primary text-white px-8 py-3 rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 text-center"
                              >
                                Book Now
                              </Link>
                            ) : (
                              <span className="w-full md:w-auto bg-slate-100 text-slate-500 px-8 py-3 rounded-xl font-bold text-center text-sm">
                                {room.availableCount} Available
                              </span>
                            )
                          ) : (
                            <button
                              disabled
                              className="w-full md:w-auto bg-slate-200 text-slate-500 px-8 py-3 rounded-xl font-bold cursor-not-allowed"
                            >
                              Sold Out
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right Column - Booking Summary / Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Location Highlights
                </h3>
                <ul className="space-y-4 text-slate-600 text-sm">
                  <li className="flex items-start gap-3">
                    <div className="mt-1 bg-brand-primary/10 p-1.5 rounded-lg">
                      <svg
                        className="w-4 h-4 text-brand-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                        />
                      </svg>
                    </div>
                    <span>15 minutes from International Airport</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 bg-brand-primary/10 p-1.5 rounded-lg">
                      <svg
                        className="w-4 h-4 text-brand-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                        />
                      </svg>
                    </div>
                    <span>Located in the central business district</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="mt-1 bg-brand-primary/10 p-1.5 rounded-lg">
                      <svg
                        className="w-4 h-4 text-brand-primary"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                        />
                      </svg>
                    </div>
                    <span>Walking distance to premium shopping malls</span>
                  </li>
                </ul>
                <hr className="my-6 border-slate-100" />
                <div className="text-center">
                  <p className="text-sm text-slate-500 mb-2">
                    Need help with booking?
                  </p>
                  <p className="font-bold text-brand-dark">+1 (800) WINSOME</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
