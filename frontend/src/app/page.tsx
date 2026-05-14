import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="max-w-2xl rounded-3xl border border-slate-800 bg-slate-900/80 p-10 shadow-2xl shadow-slate-950/40">
        <h1 className="text-4xl font-semibold text-white">
          Winsome Hotel Booking
        </h1>
        <p className="mt-4 text-slate-300">
          A production-style hotel booking system with authentication and
          booking management.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link
            href="/login"
            className="rounded-full bg-sky-500 px-6 py-3 text-white transition hover:bg-sky-400"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-full border border-slate-700 px-6 py-3 text-slate-100 transition hover:border-slate-500"
          >
            Register
          </Link>
        </div>
      </div>
    </main>
  );
}
