"use client";

import { useRouter } from "next/navigation";
import { clearToken, getToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

export default function DashboardPage() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(getToken());
  }, []);

  const handleLogout = () => {
    clearToken();
    router.push("/login");
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/50">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-semibold">Dashboard</h1>
            <p className="mt-2 text-slate-400">
              You are logged in and can manage hotel bookings.
            </p>
          </div>
          <Button variant="secondary" onClick={handleLogout}>
            Logout
          </Button>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-950/60 p-6">
          <p className="text-slate-300">
            Your auth token is currently stored and will be used for
            authenticated API requests.
          </p>
          <p className="mt-4 break-words text-sm text-slate-400">
            {token ? token : "No token detected"}
          </p>
        </div>
      </div>
    </main>
  );
}
