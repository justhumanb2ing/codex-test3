import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";
import { AppHeader } from "@/components/layout/app-header";
import { PwaProvider } from "@/components/pwa/pwa-provider";
import { NotificationProvider } from "@/components/pwa/notification-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codex",
  description: "Codex 독서 기록 애플리케이션",
  manifest: "/manifest.json",
  themeColor: "#020617",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} bg-background text-foreground antialiased`}
      >
        <PwaProvider />
        <NotificationProvider />
        <div className="flex min-h-screen flex-col md:flex-row">
          <AppHeader />
          <div className="flex-1 overflow-y-auto pb-20 md:pb-0">
            <main className="mx-auto w-full max-w-5xl px-4 py-8">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
