"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { getUser } from "@/lib/auth";

const roomSchema = z.object({
  type: z.string().min(2, "Room type is required (e.g., Deluxe, Suite)"),
  capacity: z.preprocess((val) => Number(val), z.number().min(1, "Capacity must be at least 1")),
  pricePerNight: z.preprocess((val) => Number(val), z.number().min(1, "Price must be greater than 0")),
  availableCount: z.preprocess((val) => Number(val), z.number().min(0, "Availability cannot be negative")),
  hotelId: z.string().min(1, "You must select a hotel for this room"),
});

type RoomFormValues = z.infer<typeof roomSchema>;

interface Hotel {
  id: string;
  name: string;
}

export default function AddRoomPage() {
  const router = useRouter();
  const user = getUser();
  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      capacity: 2,
      availableCount: 1,
    }
  });

  useEffect(() => {
    // If the user is a hotel manager, auto-assign their hotel ID
    if (user?.role === "HOTEL_MANAGER" && user?.managedHotel) {
      setValue("hotelId", user.managedHotel.id);
    } 
    // If the user is an Admin, fetch all hotels so they can pick one
    else if (user?.role === "ADMIN") {
      const fetchHotels = async () => {
        try {
          const response = await api.get("/hotels");
          // If the API is paginated, it might be response.data.data
          const data = Array.isArray(response.data) ? response.data : response.data.data;
          setHotels(data || []);
        } catch (err) {
          console.error("Failed to fetch hotels:", err);
        }
      };
      fetchHotels();
    }
  }, [user, setValue]);

  const onSubmit = async (values: RoomFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/rooms", values);
      router.push("/dashboard/rooms");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to add room");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Add New Room</h1>
        <p className="text-slate-500 text-sm">Create a new room type and set its pricing and availability.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {user?.role === "ADMIN" && (
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Select Hotel</label>
              <select 
                {...register("hotelId")}
                className={`w-full h-11 px-4 rounded-xl border ${errors.hotelId ? 'border-red-300 ring-red-50' : 'border-slate-200'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all`}
              >
                <option value="">Choose a hotel...</option>
                {hotels.map(hotel => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name}
                  </option>
                ))}
              </select>
              {errors.hotelId && <p className="text-xs text-red-500 font-medium">{errors.hotelId.message}</p>}
            </div>
          )}

          <Input
            label="Room Type"
            placeholder="e.g. Deluxe Suite, Single Room"
            {...register("type")}
            error={errors.type?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Capacity (Guests)"
              type="number"
              min="1"
              {...register("capacity")}
              error={errors.capacity?.message}
            />
            <Input
              label="Price per Night ($)"
              type="number"
              step="0.01"
              min="1"
              {...register("pricePerNight")}
              error={errors.pricePerNight?.message}
            />
            <Input
              label="Available Count"
              type="number"
              min="0"
              {...register("availableCount")}
              error={errors.availableCount?.message}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button 
            type="button" 
            variant="secondary" 
            className="flex-1"
            onClick={() => router.back()}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            className="flex-1" 
            isLoading={isLoading}
          >
            Create Room
          </Button>
        </div>
      </form>
    </div>
  );
}
