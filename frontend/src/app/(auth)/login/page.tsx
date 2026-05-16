"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { setToken, setUser } from "@/lib/auth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [globalError, setGlobalError] = useState<any>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginFormValues) => {
    setError(null);
    setIsLoading(true);

    try {
      const response = await api.post("/auth/login", values);
      setToken(response.data.accessToken);
      setUser(response.data.user);
      router.push("/dashboard");
    } catch (err: any) {
      if (!err.response || err.response.status >= 500) {
        setGlobalError(err);
      } else {
        setError(err?.response?.data?.message || "Login failed");
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (globalError) {
    throw globalError;
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
        <h1 className="text-3xl font-bold text-slate-900">Login</h1>
        <p className="mt-2 text-slate-500">
          Access your hotel booking dashboard.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <Input
            label="Email"
            type="email"
            error={errors.email?.message}
            {...register("email")}
          />
          <Input
            label="Password"
            type="password"
            error={errors.password?.message}
            {...register("password")}
          />

          {error ? <p className="text-sm text-rose-400">{error}</p> : null}

          <Button
            type="submit"
            variant="primary"
            loading={isLoading}
            className="w-full"
          >
            Sign in
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-500">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-medium text-brand-primary hover:text-brand-primary/80"
          >
            Register
          </Link>
        </p>
      </div>
    </main>
  );
}
