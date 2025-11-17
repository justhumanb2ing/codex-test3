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
    <div className="py-6 border min-h-screen rounded-4xl bg-background shadow-md rounded-b-none">
      {children}
    </div>
  );
}
