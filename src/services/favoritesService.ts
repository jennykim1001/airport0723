import { supabase } from '../lib/supabaseClient';
import type { FavoriteSlot } from '../types';

// Supabase Database(RLS 적용)를 사용한다. 함수 시그니처는 목업 단계와
// 동일하게 유지한다.

interface FavoriteRow {
  id: string;
  user_id: string;
  adate: string;
  atime: string;
  terminal: FavoriteSlot['terminal'];
  gate_type: FavoriteSlot['gateType'];
  created_at: string;
}

function toFavoriteSlot(row: FavoriteRow): FavoriteSlot {
  return {
    id: row.id,
    userId: row.user_id,
    date: row.adate,
    time: row.atime.slice(0, 5),
    terminal: row.terminal,
    gateType: row.gate_type,
    createdAt: row.created_at,
  };
}

export async function listFavorites(userId: string): Promise<FavoriteSlot[]> {
  const { data, error } = await supabase
    .from('favorites')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(toFavoriteSlot);
}

export async function addFavorite(
  input: Omit<FavoriteSlot, 'id' | 'createdAt'>
): Promise<FavoriteSlot> {
  const { data, error } = await supabase
    .from('favorites')
    .insert({
      user_id: input.userId,
      adate: input.date,
      atime: input.time,
      terminal: input.terminal,
      gate_type: input.gateType,
    })
    .select()
    .single();
  if (error) throw error;
  return toFavoriteSlot(data);
}

export async function removeFavorite(favoriteId: string): Promise<void> {
  const { error } = await supabase.from('favorites').delete().eq('id', favoriteId);
  if (error) throw error;
}
