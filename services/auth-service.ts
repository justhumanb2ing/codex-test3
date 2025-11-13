import "server-only";

import type { User } from "@supabase/supabase-js";

import { createSupabaseServerClient } from "@/config/supabase";
import { buildAuthCallbackUrl } from "@/lib/site-url";

export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthResult {
  success: boolean;
  error?: string;
}

export interface OAuthResult extends AuthResult {
  redirectUrl?: string;
}

const defaultErrorMessage = "요청을 처리하는 중 문제가 발생했습니다.";

const buildResult = (success: boolean, error?: string): AuthResult => ({
  success,
  error,
});

/**
 * 이메일과 비밀번호를 이용해 사용자를 로그인시킵니다.
 */
export const signInWithEmail = async ({
  email,
  password,
}: AuthCredentials): Promise<AuthResult> => {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return buildResult(false, error.message ?? defaultErrorMessage);
  }

  return buildResult(true);
};

/**
 * 새로운 사용자를 이메일과 비밀번호로 등록합니다.
 */
export const signUpWithEmail = async ({
  email,
  password,
}: AuthCredentials): Promise<AuthResult> => {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
  });

  if (error) {
    return buildResult(false, error.message ?? defaultErrorMessage);
  }

  return buildResult(true);
};

/**
 * 현재 사용자를 로그아웃 시킵니다.
 */
export const signOutUser = async (): Promise<AuthResult> => {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();

  if (error) {
    return buildResult(false, error.message ?? defaultErrorMessage);
  }

  return buildResult(true);
};

/**
 * SSR 환경에서 현재 인증된 사용자를 반환합니다.
 */
export const getCurrentUser = async (): Promise<User | null> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error || !data?.user) {
    return null;
  }

  return data.user;
};

/**
 * 카카오 OAuth 로그인을 시작합니다.
 */
export const signInWithKakao = async (nextPath = "/"): Promise<OAuthResult> => {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "kakao",
    options: {
      redirectTo: buildAuthCallbackUrl(nextPath),
      scopes: "profile_nickname profile_image",
    },
  });

  if (error || !data?.url) {
    return {
      success: false,
      error: error?.message ?? defaultErrorMessage,
    };
  }

  return { success: true, redirectUrl: data.url };
};
