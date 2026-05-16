import Link from "next/link";
import { ReactNode } from "react";
import { UserNavbar } from "./UserNavbar";
import { cookies } from "next/headers";

interface UserLayoutProps {
  children: ReactNode;
}

export const UserLayout = async ({ children }: UserLayoutProps) => {
  const cookieStore = await cookies();
  const isAuth = cookieStore.has("auth_token");
  const userCookie = cookieStore.get("auth_user");
  let isUser = false;
  
  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value));
      isUser = user?.role === "USER";
    } catch (e) {}
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-brand-primary flex items-center justify-center text-white font-bold">
                W
              </div>
              <span className="text-xl font-bold tracking-tight text-brand-dark">
                Winsome
              </span>
            </Link>
            <nav className="hidden md:block">
              <ul className="flex items-center gap-6">
                <li>
                  <Link href="/hotels" className="text-sm font-medium text-slate-600 hover:text-brand-primary">
                    Hotels
                  </Link>
                </li>
               {isAuth && isUser && (
                <li>
                  <Link href="/bookings" className="text-sm font-medium text-slate-600 hover:text-brand-primary">
                    My Bookings
                  </Link>
                </li>
               )}
              </ul>
            </nav>
          </div>
          <UserNavbar />
        </div>
      </header>

      <main className="flex-1 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </main>

      <footer className="border-t border-slate-200 bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
            <div className="col-span-1 md:col-span-2">
              <span className="text-xl font-bold text-brand-dark">Winsome</span>
              <p className="mt-4 max-w-xs text-sm text-slate-500">
                Experience luxury and comfort in our hand-picked selection of world-class hotels.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Explore</h4>
              <ul className="mt-4 space-y-2">
                <li><Link href="/hotels" className="text-sm text-slate-600 hover:text-brand-primary">All Hotels</Link></li>
                <li><Link href="/offers" className="text-sm text-slate-600 hover:text-brand-primary">Special Offers</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900">Support</h4>
              <ul className="mt-4 space-y-2">
                <li><Link href="/contact" className="text-sm text-slate-600 hover:text-brand-primary">Contact Us</Link></li>
                <li><Link href="/faq" className="text-sm text-slate-600 hover:text-brand-primary">FAQs</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-12 border-t border-slate-200 pt-8">
           
          </div>
        </div>
      </footer>
    </div>
  );
};
