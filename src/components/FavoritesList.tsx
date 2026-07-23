import type { FavoriteSlot } from '../types';

interface FavoritesListProps {
  favorites: FavoriteSlot[];
  onSelect: (favorite: FavoriteSlot) => void;
  onRemove: (favoriteId: string) => void;
}

const GATE_LABEL: Record<FavoriteSlot['gateType'], string> = {
  arrival: '입국장',
  departure: '출국장',
};

export function FavoritesList({ favorites, onSelect, onRemove }: FavoritesListProps) {
  if (favorites.length === 0) {
    return (
      <section className="favorites-list">
        <h2>즐겨찾기</h2>
        <p>저장된 즐겨찾기가 없습니다.</p>
      </section>
    );
  }

  return (
    <section className="favorites-list">
      <h2>즐겨찾기</h2>
      <ul>
        {favorites.map((favorite) => (
          <li key={favorite.id}>
            <button type="button" className="favorites-list__item" onClick={() => onSelect(favorite)}>
              {favorite.date} {favorite.time} · {favorite.terminal} {GATE_LABEL[favorite.gateType]}
            </button>
            <button type="button" onClick={() => onRemove(favorite.id)}>
              삭제
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
