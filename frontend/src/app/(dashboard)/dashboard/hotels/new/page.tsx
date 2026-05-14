"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const hotelSchema = z.object({
  name: z.string().min(3, "Hotel name must be at least 3 characters"),
  city: z.string().min(2, "City name is required"),
  address: z.string().min(5, "Address is required"),
  stars: z.preprocess((val) => Number(val), z.number().min(1).max(5)),
  managerId: z.string().min(1, "You must assign a hotel manager"),
});

type HotelFormValues = z.infer<typeof hotelSchema>;

interface Manager {
  id: string;
  name: string;
  email: string;
}

export default function NewHotelPage() {
  const router = useRouter();
  const [managers, setManagers] = useState<Manager[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<HotelFormValues>({
    resolver: zodResolver(hotelSchema),
    defaultValues: {
      stars: 5,
    }
  });

  useEffect(() => {
    const fetchManagers = async () => {
      try {
        const response = await api.get("/auth/managers");
        setManagers(response.data);
      } catch (err) {
        console.error("Failed to fetch managers:", err);
      }
    };
    fetchManagers();
  }, []);

  const onSubmit = async (values: HotelFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/hotels", values);
      router.push("/dashboard/hotels");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create hotel");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Add New Hotel</h1>
        <p className="text-slate-500 text-sm">Fill in the details to register a new hotel in the system.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Hotel Name"
            placeholder="e.g. Winsome Grand Hotel"
            {...register("name")}
            error={errors.name?.message}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="e.g. Dubai"
              {...register("city")}
              error={errors.city?.message}
            />
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-slate-700">Stars (1-5)</label>
              <select 
                {...register("stars")}
                className="w-full h-11 px-4 rounded-xl border border-slate-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all"
              >
                <option value="1">1 Star</option>
                <option value="2">2 Stars</option>
                <option value="3">3 Stars</option>
                <option value="4">4 Stars</option>
                <option value="5">5 Stars</option>
              </select>
              {errors.stars && <p className="text-xs text-red-500 font-medium">{errors.stars.message}</p>}
            </div>
          </div>

          <Input
            label="Full Address"
            placeholder="e.g. 123 Luxury Ave, Downtown"
            {...register("address")}
            error={errors.address?.message}
          />

          <div className="space-y-1.5">
            <label className="text-sm font-semibold text-slate-700">Assign Hotel Manager</label>
            <select 
              {...register("managerId")}
              className={`w-full h-11 px-4 rounded-xl border ${errors.managerId ? 'border-red-300 ring-red-50' : 'border-slate-200'} bg-white text-sm focus:outline-none focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary transition-all`}
            >
              <option value="">Select a manager</option>
              {managers.map(manager => (
                <option key={manager.id} value={manager.id}>
                  {manager.name} ({manager.email})
                </option>
              ))}
            </select>
            {errors.managerId && <p className="text-xs text-red-500 font-medium">{errors.managerId.message}</p>}
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
            Create Hotel
          </Button>
        </div>
      </form>
    </div>
  );
}
