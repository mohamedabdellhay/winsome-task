import { UserLayout } from "@/components/layouts/UserLayout";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return <UserLayout>{children}</UserLayout>;
}
