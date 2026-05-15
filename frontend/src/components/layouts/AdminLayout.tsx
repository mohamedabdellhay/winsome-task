"use client";

import Link from "next/link";
import { ReactNode, useEffect, useState } from "react";
import { clearToken, getUser, isAdmin } from "@/lib/auth";
import { useRouter } from "next/navigation";

interface AdminLayoutProps {
  children: ReactNode;
}

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    setUser(getUser());
    setAdmin(isAdmin());
  }, []);

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar - Fixed to left for LTR, mirrored for RTL */}
      <aside className="w-64 flex-shrink-0 border-r border-slate-200 bg-white shadow-sm">
        <div className="flex h-16 items-center px-6 border-b border-slate-100">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="h-7 w-7 rounded bg-brand-primary flex items-center justify-center text-white font-bold text-xs">
              W
            </div>
            <span className="text-lg font-bold text-brand-dark">Admin</span>
          </Link>
        </div>
        
        <nav className="mt-6 px-4 space-y-1">
          <Link 
            href="/dashboard" 
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Dashboard
          </Link>
          {admin && (
            <Link 
              href="/dashboard/hotels" 
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              Hotels
            </Link>
          )}
          <Link 
            href="/dashboard/bookings" 
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Bookings
          </Link>
          <Link 
            href="/dashboard/rooms" 
            className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
          >
            Rooms
          </Link>
        
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col">
        {/* Header */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-8">
          <h2 className="text-lg font-semibold text-brand-dark"></h2>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-sm font-semibold text-slate-900">{user?.name || "Admin User"}</span>
              <span className="text-xs text-slate-500 capitalize">{user?.role || "Admin"}</span>
            </div>
            <button 
              onClick={handleLogout}
              className="rounded-full border border-slate-200 px-4 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Logout
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-200" />
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8">
          <div className="mx-auto max-w-6xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
