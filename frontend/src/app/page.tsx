import Link from "next/link";
import { UserLayout } from "@/components/layouts/UserLayout";

export default function HomePage() {
  return (
    <UserLayout>
      <div className="relative overflow-hidden bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl">
              Discover the Art of <span className="text-brand-primary">Luxury Booking</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-slate-600">
              Experience unparalleled hospitality and world-class services at your fingertips. 
              Find your perfect stay with Winsome.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-full bg-brand-primary px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-brand-primary/20 hover:bg-brand-primary/90 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-primary"
              >
                Get Started
              </Link>
              <Link href="/hotels" className="text-sm font-semibold leading-6 text-slate-900">
                Explore Hotels <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
        
        {/* Background Decorative Element */}
        <div className="absolute top-0 -z-10 h-full w-full bg-[radial-gradient(circle_at_top_right,_var(--brand-primary)_0%,_transparent_25%)] opacity-5"></div>
      </div>
    </UserLayout>
  );
}
