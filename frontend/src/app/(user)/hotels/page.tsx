import Link from "next/link";
import { notFound } from "next/navigation";

interface Hotel {
  id: string;
  name: string;
  city: string;
  address: string;
  stars: number;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

interface HotelsApiResponse {
  data: Hotel[];
  meta: Meta;
}

const API_BASE_URL =
  (process.env.API_URL || process.env.NEXT_PUBLIC_API_URL)?.replace(/\/$/, "") ??
  "http://localhost:3001";

async function fetchHotels(search: string, page: number, limit: number): Promise<HotelsApiResponse> {
  const params = new URLSearchParams();
  if (search) {
    params.set("search", search);
  }
  params.set("page", String(page));
  params.set("limit", String(limit));

  const response = await fetch(`${API_BASE_URL}/api/v1/hotels?${params.toString()}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    if (response.status === 404) {
      notFound();
    }
    throw new Error(`Failed to load hotels: ${response.status}`);
  }

  return response.json();
}

export const dynamic = "force-dynamic";

type HotelsSearchParams = {
  search?: string | string[];
  page?: string | string[];
};

export default async function HotelsListPage({
  searchParams,
}: {
  searchParams?: Promise<HotelsSearchParams> | HotelsSearchParams;
}) {
  const resolvedSearchParams = await searchParams;
  const rawSearch = Array.isArray(resolvedSearchParams?.search)
    ? resolvedSearchParams.search[0]
    : resolvedSearchParams?.search;
  const rawPage = Array.isArray(resolvedSearchParams?.page)
    ? resolvedSearchParams.page[0]
    : resolvedSearchParams?.page;

  const search = (rawSearch ?? "").trim();
  const page = Number(rawPage) > 0 ? Number(rawPage) : 1;
  const limit = 9;

  const { data: hotels, meta } = await fetchHotels(search, page, limit);
  const hasSearch = search.length > 0;
  const searchQuery = hasSearch ? `search=${encodeURIComponent(search)}&` : "";
  const previousPage = Math.max(1, meta.page - 1);
  const nextPage = Math.min(meta.totalPages, meta.page + 1);

  return (
    <>
      <div className="bg-slate-50 min-h-[calc(100vh-64px)] py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex mb-10 space-y-6">
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-extrabold text-brand-dark tracking-tight">
                Discover our Luxury Hotels
              </h1>
              <p className="mt-2 text-lg text-slate-600">
                Choose from our curated selection of top-rated destinations.
              </p>
            </div>

            <div className="mx-auto max-w-2xl grow">
              <form method="get" action="/hotels" className="relative">
                <label htmlFor="hotel-search" className="sr-only">
                  Search hotels
                </label>
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-slate-400">
                  <svg
                    className="h-5 w-5"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
                <input
                  id="hotel-search"
                  name="search"
                  type="search"
                  defaultValue={search}
                  placeholder="Search hotels, city, or address..."
                  className="w-full rounded-3xl border border-slate-200 bg-white px-5 py-4 pl-12 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                />
                {hasSearch && (
                  <Link
                    href="/hotels"
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200"
                    aria-label="Clear search"
                  >
                    ×
                  </Link>
                )}
              </form>
            </div>
          </div>

          <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              {hasSearch
                ? `Page ${meta.page} of ${meta.totalPages} · Showing ${hotels.length} of ${meta.total} hotels for "${search}"`
                : `Page ${meta.page} of ${meta.totalPages} · Showing ${hotels.length} of ${meta.total} hotels`}
            </p>
            <div className="flex items-center gap-2">
              {meta.page > 1 ? (
                <Link
                  href={`/hotels?${searchQuery}page=${previousPage}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Previous
                </Link>
              ) : (
                <span className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400">
                  Previous
                </span>
              )}
              {meta.page < meta.totalPages ? (
                <Link
                  href={`/hotels?${searchQuery}page=${nextPage}`}
                  className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  Next
                </Link>
              ) : (
                <span className="rounded-full border border-slate-200 bg-slate-100 px-4 py-2 text-sm font-semibold text-slate-400">
                  Next
                </span>
              )}
            </div>
          </div>

          {hotels.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300">
              <p className="text-slate-500">
                No hotels available at the moment. Please check back later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {hotels.map((hotel) => (
                <div
                  key={hotel.id}
                  className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group"
                >
                  <div className="aspect-[16/10] bg-slate-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-brand-primary shadow-sm">
                      NEW
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-brand-primary transition-colors">
                          {hotel.name}
                        </h3>
                        <p className="text-sm text-slate-500 mt-1 flex items-center gap-1">
                          <svg
                            className="w-4 h-4 text-brand-primary"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          {hotel.city}
                        </p>
                      </div>
                      <div className="flex text-amber-400 text-sm">
                        {[...Array(hotel.stars)].map((_, i) => (
                          <span key={i}>★</span>
                        ))}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 line-clamp-2 leading-relaxed">
                      Experience world-class service at {hotel.name}, located at {hotel.address}. Perfect for business and leisure.
                    </p>
                    <div className="pt-4 flex items-center justify-between border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
                          Starts from
                        </span>
                        <p className="text-lg font-bold text-brand-dark">
                          $199
                          <span className="text-sm font-normal text-slate-500">
                            /night
                          </span>
                        </p>
                      </div>
                      <Link
                        href={`/hotels/${hotel.id}`}
                        className="bg-brand-primary text-white px-5 py-2.5 rounded-full text-sm font-bold hover:bg-brand-primary/90 transition-colors shadow-lg shadow-brand-primary/20"
                      >
                        Book Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
