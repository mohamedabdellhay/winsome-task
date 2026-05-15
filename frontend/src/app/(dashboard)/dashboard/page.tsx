"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";

interface DashboardStats {
  totalHotels: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  totalRevenue: number;
}

import { isAdmin as checkIsAdmin, isStaff as checkIsStaff, getUser } from "@/lib/auth";
import Link from "next/link";

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const adminStatus = checkIsAdmin();
    const staffStatus = checkIsStaff();
    const currentUser = getUser();
    
    setIsAdmin(adminStatus);
    setIsStaff(staffStatus);
    setUser(currentUser);

    if (!staffStatus) {
      setIsLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const response = await api.get("/dashboard/stats");
        setStats(response.data);
      } catch (err) {
        console.error("Failed to fetch dashboard stats:", err);
        setError("Failed to load dashboard data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="space-y-10 animate-in fade-in duration-500">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">Welcome back!</h1>
            <p className="text-slate-500 mt-2 text-lg font-medium">Ready for your next adventure?</p>
          </div>
          <Link 
            href="/hotels" 
            className="bg-brand-primary text-white px-8 py-3.5 rounded-2xl font-bold hover:bg-brand-primary/90 transition-all shadow-xl shadow-brand-primary/20 flex items-center justify-center gap-2 text-center"
          >
            Explore Hotels
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 group hover:border-brand-primary/20 transition-all">
            <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">My Bookings</h3>
            <p className="text-slate-500 font-medium mb-6">Manage your upcoming stays and view your travel history.</p>
            <Link href="/bookings" className="text-brand-primary font-bold inline-flex items-center gap-1 hover:gap-2 transition-all">
              View all bookings <span>→</span>
            </Link>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-xl shadow-slate-200/40 group hover:border-brand-primary/20 transition-all">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-7.714 2.143L11 21l-2.286-6.857L1 12l7.714-2.143L11 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">Explore Deals</h3>
            <p className="text-slate-500 font-medium mb-6">Discover exclusive offers on luxury hotels around the world.</p>
            <Link href="/hotels" className="text-brand-primary font-bold inline-flex items-center gap-1 hover:gap-2 transition-all">
              Find hotels <span>→</span>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-4 bg-rose-50 text-rose-600 rounded-xl border border-rose-100 font-medium">
        {error || "An unexpected error occurred."}
      </div>
    );
  }

  const icons = {
    hotel: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    bookings: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    confirmed: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    pending: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    revenue: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 1.343-3 3s1.343 3 3 3 3 1.343 3 3-1.343 3-3 3m0-12c-1.657 0-3 1.343-3 3s1.343 3 3 3 3-1.343 3-3-1.343-3-3-3m0 12V4m0 18v-4" />
      </svg>
    ),
  };

  const kpis = [
    { 
      label: "Total Hotels", 
      value: stats.totalHotels, 
      icon: icons.hotel, 
      color: "bg-blue-50 text-blue-600",
      description: "Registered in system",
      hidden: !isAdmin
    },
    { 
      label: "Total Bookings", 
      value: stats.totalBookings, 
      icon: icons.bookings, 
      color: "bg-indigo-50 text-indigo-600",
      description: isAdmin ? "Across all statuses" : "At your hotel"
    },
    { 
      label: "Confirmed", 
      value: stats.confirmedBookings, 
      icon: icons.confirmed, 
      color: "bg-emerald-50 text-emerald-600",
      description: "Paid and verified"
    },
    { 
      label: "Pending", 
      value: stats.pendingBookings, 
      icon: icons.pending, 
      color: "bg-amber-50 text-amber-600",
      description: "Awaiting confirmation"
    },
    { 
      label: "Total Revenue", 
      value: `$${stats.totalRevenue.toLocaleString()}`, 
      icon: icons.revenue, 
      color: "bg-brand-primary/10 text-brand-primary",
      description: "From confirmed bookings"
    },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {isAdmin ? "System Overview" : "Hotel Performance"}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">
            {isAdmin ? "Real-time performance metrics" : `Analytics for ${user?.managedHotel?.name || "your assigned hotel"}`}
          </p>
        </div>
        <Link 
          href="/dashboard/bookings" 
          className="bg-brand-primary text-white px-6 py-2.5 rounded-xl font-bold hover:bg-brand-primary/90 transition-all shadow-lg shadow-brand-primary/20 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Manage Bookings
        </Link>
      </div>

      <div className={`grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 ${isAdmin ? 'xl:grid-cols-5' : 'xl:grid-cols-4'}`}>
        {kpis.filter(kpi => !kpi.hidden).map((kpi, index) => (
          <div 
            key={index} 
            onClick={() => kpi.label.includes("Bookings") ? window.location.href = "/dashboard/bookings" : null}
            className={`group relative rounded-3xl border border-slate-100 bg-white p-6 shadow-xl shadow-slate-200/40 hover:shadow-2xl hover:shadow-brand-primary/5 transition-all duration-300 ${kpi.label.includes("Bookings") ? "cursor-pointer" : ""}`}
          >
            <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-2xl text-2xl transition-transform group-hover:scale-110 duration-300 ${kpi.color}`}>
              {kpi.icon}
            </div>
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">{kpi.label}</h3>
            <p className="mt-2 text-3xl font-extrabold text-slate-900">{kpi.value}</p>
            <p className="mt-1 text-xs text-slate-400 font-medium">{kpi.description}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-slate-100 bg-white p-8 shadow-xl shadow-slate-200/40">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Recent Activity Analysis</h2>
        <div className="h-64 flex items-center justify-center border-2 border-dashed border-slate-50 rounded-2xl">
          <p className="text-slate-400 text-sm italic font-medium">Analytics visualization module under development</p>
        </div>
      </div>
    </div>
  );
}
