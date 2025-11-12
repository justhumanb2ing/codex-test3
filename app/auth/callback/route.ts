import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { createSupabaseServerClient } from "@/config/supabase"

const buildRedirectTarget = ({
  origin,
  forwardedHost,
  nextPath,
}: {
  origin: string
  forwardedHost?: string | null
  nextPath: string
}) => {
  const safePath = nextPath.startsWith("/") ? nextPath : "/"
  const isLocal = process.env.NODE_ENV === "development"

  if (isLocal || !forwardedHost) {
    return `${origin}${safePath}`
  }

  return `https://${forwardedHost}${safePath}`
}

const applyCookies = (
  response: NextResponse,
  cookiesToSet: Parameters<Awaited<ReturnType<typeof cookies>>["set"]>[],
) => {
  cookiesToSet.forEach((args) => {
    response.cookies.set(...args)
  })
  return response
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")
  const forwardedHost = request.headers.get("x-forwarded-host")

  let nextPath = searchParams.get("next") ?? "/"
  if (!nextPath.startsWith("/")) {
    nextPath = "/"
  }

  const cookieStore = await cookies()
  const pendingCookies: Parameters<typeof cookieStore.set>[] = []

  if (code) {
    const supabase = await createSupabaseServerClient({
      cookieStore,
      cookieSetter: {
        set: (...args) => {
          pendingCookies.push(args)
          cookieStore.set(...args)
        },
      },
    })
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      const redirectTarget = buildRedirectTarget({
        origin,
        forwardedHost,
        nextPath,
      })
      return applyCookies(NextResponse.redirect(redirectTarget), pendingCookies)
    }
  }

  return applyCookies(
    NextResponse.redirect(`${origin}/auth/auth-code-error`),
    pendingCookies,
  )
}
