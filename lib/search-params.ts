type SearchParams =
  | Record<string, string | string[] | undefined>
  | undefined

/**
 * URLSearchParams 형태의 객체에서 단일 문자열 값을 반환합니다.
 */
export const getSearchParam = (
  searchParams: SearchParams,
  key: string,
): string | undefined => {
  if (!searchParams) return undefined
  const value = searchParams[key]
  if (!value) return undefined
  return Array.isArray(value) ? value[0] : value
}
