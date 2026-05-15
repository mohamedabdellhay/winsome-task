"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { getUser } from "@/lib/auth";

interface Hotel {
  name: string;
}

interface Room {
  id: string;
  type: string;
  capacity: number;
  pricePerNight: string;
  availableCount: number;
  hotel: Hotel;
}

export default function RoomsManagementPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    setUser(getUser());
    const fetchRooms = async () => {
      try {
        const response = await api.get(`/rooms?page=${page}&limit=${limit}`);
        setRooms(response.data.data || []);
        setTotalPages(response.data.meta?.totalPages || 1);
      } catch (error) {
        console.error("Failed to fetch rooms:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRooms();
  }, [page]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-brand-dark">Rooms Management</h1>
        {/* Only show Add Room if they are an admin or a manager who actually has a hotel */}
        {(user?.role === "ADMIN" || (user?.role === "HOTEL_MANAGER" && user?.managedHotel)) && (
          <Link href="/dashboard/rooms/new">
            <Button>Add New Room</Button>
          </Link>
        )}
      </div>

      {user?.role === "HOTEL_MANAGER" && !user?.managedHotel && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-xl text-sm">
          You have not been assigned a hotel yet. Contact an administrator to be assigned to a hotel before you can manage rooms.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-slate-500">Loading rooms...</div>
        ) : rooms.length === 0 ? (
          <div className="p-8 text-center text-slate-500">No rooms found.</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="px-6 py-4">Room Type</th>
                <th className="px-6 py-4">Hotel</th>
                <th className="px-6 py-4">Capacity</th>
                <th className="px-6 py-4">Price / Night</th>
                <th className="px-6 py-4">Available</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {rooms.map((room) => (
                <tr key={room.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-bold text-slate-900 capitalize">{room.type}</td>
                  <td className="px-6 py-4 text-slate-600 font-medium">{room.hotel?.name}</td>
                  <td className="px-6 py-4 text-slate-600">{room.capacity} Guests</td>
                  <td className="px-6 py-4 text-brand-dark font-bold">${room.pricePerNight}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-md text-xs font-bold ${room.availableCount > 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {room.availableCount}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <Link href={`/dashboard/rooms/${room.id}`} className="text-brand-primary font-semibold text-sm hover:underline">
                      Edit
                    </Link>
                  </td>
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
    </div>
  );
}
