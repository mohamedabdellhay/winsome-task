"use client";

import { useEffect, useState } from "react";
import { getToken, clearToken } from "@/lib/auth";

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(getToken());
  }, []);

  const signOut = () => {
    clearToken();
    setToken(null);
  };

  return { token, isAuthenticated: Boolean(token), signOut };
}
