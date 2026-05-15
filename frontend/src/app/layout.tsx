import "./globals.css";
import type { Metadata } from "next";

import { ToastProvider } from "@/components/ui/Toast";

export const metadata: Metadata = {
  title: "Winsome Hotel Booking",
  description: "Hotel booking management system",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head >
        <title>Winsome Hotel Booking</title>

        <link rel="icon" href="/icon.jpg" type="image/jpeg" />
      </head>
      <body>
        <ToastProvider>
          {children}
        </ToastProvider>
      </body>
    </html>
  );
}
