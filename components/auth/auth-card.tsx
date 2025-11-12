import type { ReactNode } from "react"

interface AuthCardProps {
  title: string
  description: string
  children: ReactNode
  footer?: ReactNode
}

export const AuthCard = ({
  title,
  description,
  children,
  footer,
}: AuthCardProps) => (
  <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-4 py-16">
    <div className="rounded-2xl border border-border bg-white/90 p-8 shadow-xl backdrop-blur-sm dark:bg-zinc-900/70">
      <div className="mb-8 space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      {children}
    </div>
    {footer ? (
      <p className="mt-6 text-center text-sm text-muted-foreground">{footer}</p>
    ) : null}
  </div>
)
