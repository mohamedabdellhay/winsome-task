import axios, { AxiosError } from "axios";
import { getToken, clearToken } from "./auth";

const getBaseURL = () => {
  const envUrl = process.env.NEXT_PUBLIC_API_URL || process.env.API_URL;

  let baseUrl = envUrl && envUrl !== "undefined" ? envUrl : "http://localhost:3001";

  if (envUrl && envUrl !== "undefined" && !envUrl.includes("localhost")) {
    baseUrl = envUrl;
  } else if (typeof window !== "undefined") {
    const { protocol, hostname } = window.location;
    if (hostname !== "localhost" && hostname !== "127.0.0.1") {
      baseUrl = `${protocol}//${hostname}:3001`;
    }
  }

  // Ensure trailing slash is removed before appending version
  baseUrl = baseUrl.replace(/\/$/, "");
  return `${baseUrl}/api/v1`;
};

const instance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    "Content-Type": "application/json",
  },
});

instance.interceptors.request.use((config) => {
  const token = getToken();
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const isAuthPage =
        typeof window !== "undefined" &&
        (window.location.pathname === "/login" ||
          window.location.pathname === "/register");
      if (!isAuthPage) {
        clearToken();
        if (typeof window !== "undefined") {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export const api = instance;

export async function get<T>(url: string, params?: any) {
  return instance.get<T>(url, { params });
}

export async function post<T>(url: string, data?: any) {
  return instance.post<T>(url, data);
}

export async function patch<T>(url: string, data?: any) {
  return instance.patch<T>(url, data);
}

export async function del<T>(url: string) {
  return instance.delete<T>(url);
}
