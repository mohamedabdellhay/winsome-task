"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { clearToken, isLoggedIn } from "@/lib/auth";
import { useRouter } from "next/navigation";

export const UserNavbar = () => {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);

  useEffect(() => {
    setIsAuth(isLoggedIn());
  }, []);

  const handleLogout = () => {
    clearToken();
    setIsAuth(false);
    router.push("/login");
  };

  return (
    <div className="flex items-center gap-4">
      {isAuth ? (
        <>
          <Link 
            href="/dashboard" 
            className="text-sm font-medium text-slate-600 hover:text-brand-primary"
          >
            Dashboard
          </Link>
          <button 
            onClick={handleLogout}
            className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Logout
          </button>
        </>
      ) : (
        <>
          <Link 
            href="/login" 
            className="text-sm font-medium text-slate-600 hover:text-brand-primary"
          >
            Login
          </Link>
          <Link 
            href="/register" 
            className="rounded-full bg-brand-primary px-4 py-2 text-sm font-semibold text-white hover:bg-brand-primary/90 transition-colors"
          >
            Register
          </Link>
        </>
      )}
    </div>
  );
};
