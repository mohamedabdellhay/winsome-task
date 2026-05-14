import axios, { AxiosError } from "axios";
import { getToken, clearToken } from "./auth";

const getBaseURL = () => {
  let url = process.env.NEXT_PUBLIC_API_URL;
  console.log("Environment NEXT_PUBLIC_API_URL:", url);
  if (!url || url === "undefined") {
    url = "http://localhost:3001";
  }
  console.log("Final API Base URL:", url);
  return url;
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
      clearToken();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
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
  console.log("url", url);

  return instance.post<T>(url, data);
}

export async function patch<T>(url: string, data?: any) {
  return instance.patch<T>(url, data);
}

export async function del<T>(url: string) {
  return instance.delete<T>(url);
}
