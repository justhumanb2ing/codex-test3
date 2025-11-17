import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/services/auth-service";

interface ProtectedLayoutProps {
  children: ReactNode;
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/sign-in");
  }

  return (
    <div className="py-6 border border-ring/30 min-h-screen rounded-4xl bg-background shadow-lg rounded-b-none">
      {children}
    </div>
  );
}
