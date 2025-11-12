import {
  getCurrentUser,
  signInWithEmail,
  signInWithKakao,
  signOutUser,
  signUpWithEmail,
} from "@/services/auth-service"

import { createSupabaseServerClient } from "@/config/supabase"
import { buildAuthCallbackUrl } from "@/lib/site-url"

jest.mock("@/config/supabase", () => ({
  createSupabaseServerClient: jest.fn(),
}))

jest.mock("@/lib/site-url", () => ({
  buildAuthCallbackUrl: jest.fn(() => "http://localhost/auth/callback?next=/"),
}))

type MockSupabaseClient = {
  auth: {
    signInWithPassword: jest.Mock
    signUp: jest.Mock
    signOut: jest.Mock
    getUser: jest.Mock
    signInWithOAuth: jest.Mock
  }
}

const mockedCreateClient = createSupabaseServerClient as jest.MockedFunction<
  typeof createSupabaseServerClient
>
const mockedBuildAuthCallbackUrl = buildAuthCallbackUrl as jest.MockedFunction<
  typeof buildAuthCallbackUrl
>

const createMockSupabaseClient = (): MockSupabaseClient => ({
  auth: {
    signInWithPassword: jest.fn(),
    signUp: jest.fn(),
    signOut: jest.fn(),
    getUser: jest.fn(),
    signInWithOAuth: jest.fn(),
  },
})

const prepareClient = (): MockSupabaseClient => {
  const client = createMockSupabaseClient()
  mockedCreateClient.mockResolvedValue(client as never)
  return client
}

describe("auth-service", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("로그인 성공 시 성공 결과를 반환한다", async () => {
    const client = prepareClient()
    client.auth.signInWithPassword.mockResolvedValue({ data: {}, error: null })

    const result = await signInWithEmail({
      email: "user@example.com",
      password: "secret",
    })

    expect(client.auth.signInWithPassword).toHaveBeenCalledWith({
      email: "user@example.com",
      password: "secret",
    })
    expect(result).toEqual({ success: true })
  })

  it("로그인 실패 시 에러 메시지를 반환한다", async () => {
    const client = prepareClient()
    client.auth.signInWithPassword.mockResolvedValue({
      data: null,
      error: { message: "invalid credentials" },
    })

    const result = await signInWithEmail({
      email: "user@example.com",
      password: "secret",
    })

    expect(result).toEqual({
      success: false,
      error: "invalid credentials",
    })
  })

  it("회원가입 성공 시 성공 결과를 반환한다", async () => {
    const client = prepareClient()
    client.auth.signUp.mockResolvedValue({ data: {}, error: null })

    const result = await signUpWithEmail({
      email: "new@example.com",
      password: "password123",
    })

    expect(client.auth.signUp).toHaveBeenCalledWith({
      email: "new@example.com",
      password: "password123",
    })
    expect(result).toEqual({ success: true })
  })

  it("회원가입 실패 시 에러 메시지를 반환한다", async () => {
    const client = prepareClient()
    client.auth.signUp.mockResolvedValue({
      data: null,
      error: { message: "이미 존재하는 이메일" },
    })

    const result = await signUpWithEmail({
      email: "dup@example.com",
      password: "password123",
    })

    expect(result).toEqual({
      success: false,
      error: "이미 존재하는 이메일",
    })
  })

  it("로그아웃 에러 시 실패 결과를 반환한다", async () => {
    const client = prepareClient()
    client.auth.signOut.mockResolvedValue({
      error: { message: "세션이 없습니다." },
    })

    const result = await signOutUser()

    expect(result).toEqual({
      success: false,
      error: "세션이 없습니다.",
    })
  })

  it("로그아웃 성공 시 성공 결과를 반환한다", async () => {
    const client = prepareClient()
    client.auth.signOut.mockResolvedValue({ error: null })

    const result = await signOutUser()

    expect(client.auth.signOut).toHaveBeenCalled()
    expect(result).toEqual({ success: true })
  })

  it("getCurrentUser는 사용자 정보를 반환한다", async () => {
    const client = prepareClient()
    const user = { id: "123", email: "user@example.com", created_at: "", last_sign_in_at: "" }
    client.auth.getUser.mockResolvedValue({ data: { user }, error: null })

    await expect(getCurrentUser()).resolves.toEqual(user)
  })

  it("getCurrentUser는 에러 시 null을 반환한다", async () => {
    const client = prepareClient()
    client.auth.getUser.mockResolvedValue({
      data: { user: null },
      error: { message: "만료된 토큰" },
    })

    await expect(getCurrentUser()).resolves.toBeNull()
  })

  it("signInWithKakao는 성공 시 redirectUrl을 반환한다", async () => {
    const client = prepareClient()
    client.auth.signInWithOAuth.mockResolvedValue({
      data: { url: "https://kakao.example.com" },
      error: null,
    })

    const result = await signInWithKakao("/dashboard")

    expect(mockedBuildAuthCallbackUrl).toHaveBeenCalledWith("/dashboard")
    expect(client.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: "kakao",
      options: {
        redirectTo: "http://localhost/auth/callback?next=/",
        scopes: "profile_nickname profile_image",
      },
    })
    expect(result).toEqual({
      success: true,
      redirectUrl: "https://kakao.example.com",
    })
  })

  it("signInWithKakao는 에러 시 실패 결과를 반환한다", async () => {
    const client = prepareClient()
    client.auth.signInWithOAuth.mockResolvedValue({
      data: { url: null },
      error: { message: "oauth error" },
    })

    const result = await signInWithKakao("/")

    expect(result).toEqual({
      success: false,
      error: "oauth error",
    })
  })
})
