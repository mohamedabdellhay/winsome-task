"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { isAdmin as checkIsAdmin } from "@/lib/auth";

const managerSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.literal("HOTEL_MANAGER"),
});

type ManagerFormValues = z.infer<typeof managerSchema>;

export default function CreateManagerPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!checkIsAdmin()) {
      router.push("/dashboard");
    }
  }, [router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ManagerFormValues>({
    resolver: zodResolver(managerSchema),
    defaultValues: {
      role: "HOTEL_MANAGER",
    }
  });

  const onSubmit = async (values: ManagerFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post("/auth/admin/create-user", values);
      // Redirect back to hotels since managers are managed/assigned there
      router.push("/dashboard/hotels");
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to create manager account");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-brand-dark">Create Hotel Manager</h1>
        <p className="text-slate-500 text-sm">Create a new manager account. They can then be assigned to a specific hotel.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            {...register("name")}
            error={errors.name?.message}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. manager@example.com"
            {...register("email")}
            error={errors.email?.message}
          />

          <Input
            label="Password"
            type="password"
            placeholder="Create a secure password"
            {...register("password")}
            error={errors.password?.message}
          />
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
            loading={isLoading}
          >
            Create Account
          </Button>
        </div>
      </form>
    </div>
  );
}
