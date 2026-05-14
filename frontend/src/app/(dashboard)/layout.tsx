"use client";

import { AdminLayout } from "@/components/layouts/AdminLayout";
import { UserLayout } from "@/components/layouts/UserLayout";
import { isStaff } from "@/lib/auth";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isStaffMember, setIsStaffMember] = useState(false);

  useEffect(() => {
    setIsStaffMember(isStaff());
  }, []);

  if (isStaffMember) {
    return <AdminLayout>{children}</AdminLayout>;
  }

  return <UserLayout>{children}</UserLayout>;
}
