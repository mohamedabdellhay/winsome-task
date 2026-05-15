"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { isAdmin as checkIsAdmin } from "@/lib/auth";

interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  stars: number;
  manager?: {
    name: string;
    email: string;
  };
}

export default function AdminHotelsPage() {
  const router = useRouter();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [hotelToDelete, setHotelToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = (id: string) => {
    setHotelToDelete(id);
  };

  const confirmDelete = async () => {
    if (!hotelToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/hotels/${hotelToDelete}`);
      setHotels(hotels.filter(h => h.id !== hotelToDelete));
      setHotelToDelete(null);
    } catch (error) {
      console.error("Failed to delete hotel:", error);
      alert("Failed to delete hotel.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Reset page to 1 when search query changes
  useEffect(() => {
    setPage(1);
  }, [searchQuery]);

  useEffect(() => {
    const adminStatus = checkIsAdmin();
    setIsUserAdmin(adminStatus);
    if (!adminStatus) {
      router.push("/dashboard");
    }
  }, [router]);

  useEffect(() => {
    const fetchHotels = async () => {
      setIsLoading(true);
      try {
        const queryParams = new URLSearchParams({
          page: page.toString(),
          limit: limit.toString(),
        });
        if (searchQuery) queryParams.append("search", searchQuery);

        const response = await api.get(`/hotels?${queryParams.toString()}`);
        setHotels(response.data.data);
        setTotalPages(response.data.meta.totalPages);
      } catch (error) {
        console.error("Failed to fetch hotels:", error);
      } finally {
        setIsLoading(false);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchHotels();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">Hotels Management</h1>
        {isUserAdmin && (
          <div className="flex gap-3">
            <Link href="/dashboard/managers/new">
              <Button variant="secondary">Create Manager</Button>
            </Link>
            <Link href="/dashboard/hotels/new">
              <Button>Add New Hotel</Button>
            </Link>
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
        <Input 
          placeholder="Search by hotel name or city..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading hotels...</div>
        ) : hotels.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No hotels found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Hotel Name</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Stars</th>
                <th className="px-6 py-4">Manager</th>
                {isUserAdmin && <th className="px-6 py-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {hotels.map((hotel) => (
                <tr key={hotel.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-900">{hotel.name}</td>
                  <td className="px-6 py-4 text-slate-600">{hotel.city}, {hotel.address}</td>
                  <td className="px-6 py-4">
                    <span className="flex text-amber-400">
                      {[...Array(hotel.stars)].map((_, i) => (
                        <span key={i}>★</span>
                      ))}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {hotel.manager ? (
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-900">{hotel.manager.name}</span>
                        <span className="text-xs text-slate-500">{hotel.manager.email}</span>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-400 italic">No manager assigned</span>
                    )}
                  </td>
                  {isUserAdmin && (
                    <td className="px-6 py-4 text-right space-x-3">
                      <Link href={`/dashboard/hotels/${hotel.id}`} className="text-brand-primary font-semibold text-sm hover:underline">
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(hotel.id)}
                        className="text-red-500 font-semibold text-sm hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Pagination Controls */}
        {!isLoading && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-slate-200 px-6 py-4">
            <span className="text-sm text-slate-500">
              Page <span className="font-medium text-slate-900">{page}</span> of{" "}
              <span className="font-medium text-slate-900">{totalPages}</span>
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                disabled={page === totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Tailwind Custom Modal for Delete Confirmation */}
      {hotelToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Delete Hotel</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Are you sure you want to delete this hotel? All of its data, including rooms and bookings, will be permanently removed. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex gap-3 justify-end rounded-b-2xl">
              <Button 
                variant="secondary" 
                onClick={() => setHotelToDelete(null)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                className="bg-red-600 hover:bg-red-700 focus:ring-red-600/20 shadow-red-600/20" 
                onClick={confirmDelete}
                isLoading={isDeleting}
              >
                Delete Hotel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
