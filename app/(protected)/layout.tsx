import type { ReactNode } from "react"
import { redirect } from "next/navigation"

import { getCurrentUser } from "@/services/auth-service"

interface ProtectedLayoutProps {
  children: ReactNode
}

export default async function ProtectedLayout({
  children,
}: ProtectedLayoutProps) {
  const user = await getCurrentUser()

  if (!user) {
    redirect("/login")
  }

  return <div className="mx-auto w-full max-w-3xl px-4 py-10 md:px-6">{children}</div>
}
