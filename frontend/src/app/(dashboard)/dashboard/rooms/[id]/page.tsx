"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const roomSchema = z.object({
  type: z.string().min(2, "Room type is required"),
  capacity: z.coerce.number().min(1, "Capacity must be at least 1"),
  pricePerNight: z.coerce.number().min(1, "Price must be greater than 0"),
  availableCount: z.coerce.number().min(0, "Availability cannot be negative"),
});

type RoomFormValues = z.infer<typeof roomSchema>;

export default function EditRoomPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [room, setRoom] = useState<any>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema) as any,
  });

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await api.get(`/rooms/${id}`);
        const data = response.data;
        setRoom(data);
        reset({
          type: data.type,
          capacity: data.capacity,
          pricePerNight: data.pricePerNight,
          availableCount: data.availableCount,
        });
      } catch (err: any) {
        console.error("Failed to fetch room:", err);
        setError("Failed to load room data.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoom();
  }, [id, reset]);

  const onSubmit = async (values: RoomFormValues) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await api.patch(`/rooms/${id}`, values);
      router.push("/dashboard/rooms");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to update room");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading room details...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Edit Room</h1>
        <p className="text-slate-500 text-sm">Update pricing and availability for this room.</p>
      </div>

      {room && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex justify-between items-center">
          <div>
            <p className="text-sm text-slate-500">Associated Hotel</p>
            <p className="font-bold text-slate-900">{room.hotel?.name}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Room Type"
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
            loading={isSubmitting}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </div>
  );
}
