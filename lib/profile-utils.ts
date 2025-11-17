export const buildProfileName = (
  metadata: Record<string, unknown>,
  fallback?: string,
) => {
  const fields = ["username", "custom_full_name", "full_name", "name", "nickname"]

  for (const field of fields) {
    const value = metadata?.[field]
    if (typeof value === "string" && value.trim().length > 0) {
      return value.trim()
    }
  }

  return fallback ?? "이름 없는 사용자"
}
