const ensureLeadingSlash = (path: string) =>
  path.startsWith("/") ? path : `/${path}`

export const getSiteUrl = () => {
  const vercel = process.env.NEXT_PUBLIC_VERCEL_URL
  return vercel
    ? `https://${vercel}/auth/callback`
    : "http://localhost:3000/auth/callback"
}

export const buildAuthCallbackUrl = (nextPath = "/") => {
  const callbackUrl = new URL(getSiteUrl())
  callbackUrl.searchParams.set("next", ensureLeadingSlash(nextPath) || "/")
  return callbackUrl.toString()
}
