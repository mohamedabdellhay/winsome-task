import { AdminLayout } from "@/components/layouts/AdminLayout";
import { UserLayout } from "@/components/layouts/UserLayout";
import { cookies } from "next/headers";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const userCookie = cookieStore.get("auth_user");
  let isStaffMember = false;
  
  if (userCookie) {
    try {
      const user = JSON.parse(decodeURIComponent(userCookie.value));
      isStaffMember = user?.role === "ADMIN" || user?.role === "HOTEL_MANAGER";
    } catch (e) {}
  }

  if (isStaffMember) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <UserLayout>{children}</UserLayout>;
}
