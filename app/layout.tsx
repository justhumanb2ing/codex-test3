import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { koKR } from "@clerk/localizations";
import { shadcn } from "@clerk/themes";

import "./globals.css";
import { AppHeader } from "@/components/layout/app-header";
import { MobileTopBar } from "@/components/layout/mobile-top-bar";
import { NotificationProvider } from "@/components/pwa/notification-provider";
import { PwaProvider } from "@/components/pwa/pwa-provider";

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
    <ClerkProvider
      localization={koKR}
      appearance={{
        theme: shadcn,
        layout: {
          termsPageUrl: "https://clerk.com/terms",
          unsafe_disableDevelopmentModeWarnings: true,
          socialButtonsPlacement: "bottom",
          socialButtonsVariant: "iconButton",
          logoPlacement: "outside",
        },
        captcha: {
          size: "flexible",
          language: "ko-KR",
        },
        variables: {
          colorBackground: "white",
        },
      }}
    >
      <html lang="ko">
        <body
          className={`${geistSans.variable} ${geistMono.variable} bg-background-service text-foreground antialiased`}
        >
          <PwaProvider />
          <NotificationProvider />
          <div className="flex min-h-screen flex-col md:flex-row">
            <AppHeader />
            <div className="flex-1">
              <div className="flex h-full flex-col">
                <MobileTopBar />
                <div className="flex-1 md:pb-0 md:overflow-y-auto">
                  <main className="mx-auto w-full max-w-3xl px-4 py-8 pb-0">
                    {children}
                  </main>
                </div>
              </div>
            </div>
          </div>
        </body>
      </html>
    </ClerkProvider>
  );
}
