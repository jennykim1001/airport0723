import { supabase } from '../lib/supabaseClient';
import type { AuthUser } from '../types';

// Supabase Auth(이메일/비밀번호)를 그대로 사용한다. 목업이 아니라 실제
// 연동이므로, 함수 시그니처가 곧 최종 형태다.

function toAuthUser(user: { id: string; email?: string | null } | null | undefined): AuthUser | null {
  if (!user || !user.email) return null;
  return { id: user.id, email: user.email };
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) return null;
  return toAuthUser(data.user);
}

/** 회원가입. 이메일 확인이 켜져 있으면 세션 없이 user만 반환될 수 있다 — 그 경우 null을 반환한다. */
export async function signUpWithEmail(email: string, password: string): Promise<AuthUser | null> {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  if (!data.session) return null;
  return toAuthUser(data.user);
}

export async function signInWithEmail(email: string, password: string): Promise<AuthUser> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  const user = toAuthUser(data.user);
  if (!user) throw new Error('로그인에 실패했습니다.');
  return user;
}

export async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** 세션 변경(로그인/로그아웃/토큰 갱신)을 구독한다. 반환값을 호출하면 구독이 해제된다. */
export function onAuthStateChange(callback: (user: AuthUser | null) => void): () => void {
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    callback(toAuthUser(session?.user));
  });
  return () => data.subscription.unsubscribe();
}
