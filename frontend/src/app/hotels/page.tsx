"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { isStaff as checkIsStaff } from "@/lib/auth";
import { UserLayout } from "@/components/layouts/UserLayout";

interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  stars: number;
}

export default function HotelsListPage() {
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isStaff, setIsStaff] = useState(false);

  useEffect(() => {
    setIsStaff(checkIsStaff());
  }, []);
  useEffect(() => {
    const fetchHotels = async () => {
      try {
        const response = await api.get("/hotels");
        setHotels(response.data.data || []);
      } catch {
        setError("Failed to load hotels. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHotels();
  }, []);

  return (
    <UserLayout>
      <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 text-center md:text-left">
            <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">Discover our Luxury Hotels</h1>
            <p className="mt-2 text-lg text-slate-600">Choose from our curated selection of top-rated destinations.</p>
          </div>

          {error ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-rose-100">
              <p className="text-rose-600">{error}</p>
            </div>
          ) : isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-primary"></div>
            </div>
          ) : hotels.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <p className="text-slate-500">No hotels available at the moment. Please check back later.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((hotel) => (
                <div 
                  key={hotel.id} 
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="aspect-[16/10] bg-slate-200 relative overflow-hidden">
                    {/* Placeholder for hotel image */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-primary shadow-sm">
                      NEW
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                          {hotel.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                          <svg className="w-4 h-4 text-brand-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {hotel.city}
                        </p>
                      </div>
                      <div className="flex text-amber-400 text-sm">
                        {[...Array(hotel.stars)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      Experience world-class service at {hotel.name}, located at {hotel.address}. Perfect for business and leisure.
                    </p>
                    <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Starts from</span>
                        <p className="text-lg font-bold text-brand-dark">$199<span className="text-sm font-normal text-slate-500">/night</span></p>
                      </div>
                      {!isStaff && (
                        <Link 
                          href={`/hotels/${hotel.id}`} 
                          className="bg-brand-primary text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
                        >
                          Book Now
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </UserLayout>
  );
}
